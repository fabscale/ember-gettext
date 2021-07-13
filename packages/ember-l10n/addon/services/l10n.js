import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import {
  replacePlaceholders,
  sanitizeMessageId,
  sanitizeJSON,
  getMessages,
  getPluralMessage,
} from '@ember-gettext/ember-l10n/utils/message-utils';
import fetch from 'fetch';
import { detectLocale } from '@ember-gettext/ember-l10n/utils/detect-locale';
import { PluralFactory } from '@ember-gettext/ember-l10n/utils/plural-factory';

export default class L10nService extends Service {
  @tracked locale;
  @tracked l10nTranslations;
  @tracked pluralFactory;

  // Configured via environment.js ['@ember-gettext/ember-l10n']
  defaultLocale = 'en';
  availableLocales = ['en'];
  defaultPluralFactory;

  // This will be replaced at build time via a babel plugin with the actual asset map
  _staticAssetMap;

  constructor() {
    super(...arguments);

    let config = getOwner(this).resolveRegistration('config:environment');
    let l10nConfig = config['@ember-gettext/ember-l10n'];
    this._loadConfig(l10nConfig);

    this._validateLocales();

    let { defaultLocale } = this;

    this.locale = defaultLocale;
    this.pluralFactory = new PluralFactory(defaultLocale);
    this.defaultPluralFactory = this.pluralFactory;
  }

  t(msgId, hash = {}, msgContext = '') {
    assert(
      `l10n.t(): First argument has to be a string (messageId)`,
      typeof msgId === 'string'
    );
    assert(
      `l10n.t(): Second argument has to be an object (hash)`,
      typeof hash === 'object'
    );
    assert(
      `l10n.t(): Third argument has to be a string (messageContext)`,
      typeof msgContext === 'string'
    );

    let messageId = sanitizeMessageId(msgId);

    let [message] = getMessages(this.l10nTranslations, messageId, msgContext);

    return replacePlaceholders(message || msgId, hash);
  }

  n(msgId, msgIdPlural, count = 1, hash = {}, msgContext = '') {
    assert(
      `l10n.n(): First argument has to be a string (messageId)`,
      typeof msgId === 'string'
    );
    assert(
      `l10n.n(): Second argument has to be a string (messageIdPlural)`,
      typeof msgIdPlural === 'string'
    );
    assert(
      `l10n.n(): Third argument has to be an object (hash)`,
      typeof hash === 'object'
    );
    assert(
      `l10n.n(): Fourth argument has to be a string (messageContext)`,
      typeof msgContext === 'string'
    );

    let sanitizedMessageId = sanitizeMessageId(msgId);
    let messages = getMessages(
      this.l10nTranslations,
      sanitizedMessageId,
      msgContext
    );

    let { pluralFactory, defaultPluralFactory } = this;
    let message = getPluralMessage({
      messages,
      count,
      msgId,
      msgIdPlural,
      pluralFactory,
      defaultPluralFactory,
    });

    return replacePlaceholders(message, Object.assign({ count }, hash));
  }

  // Utilities to allow translating messages without having them parsed
  tVar() {
    return this.t(...arguments);
  }

  nVar() {
    return this.n(...arguments);
  }

  async setLocale(locale) {
    assert(
      `ember-l10n: Locale ${locale} is not available to use.`,
      this.availableLocales.includes(locale)
    );

    await this._loadLocaleFile(locale);

    this.locale = locale;

    // Ensure lang attribute is set on html tag
    window.document?.documentElement.setAttribute('lang', locale);
  }

  detectLocale() {
    let { defaultLocale, availableLocales } = this;
    return detectLocale({ defaultLocale, availableLocales });
  }

  // Private
  _loadConfig(l10nConfig) {
    assert(
      `ember-l10n: You have to specify available locales in config/environment.js, like this:

'@ember-gettext/ember-l10n': {
  locales: ['en', 'de']
}`,
      Array.isArray(l10nConfig?.locales)
    );

    if (!l10nConfig) {
      return;
    }

    if (l10nConfig.locales) {
      this.availableLocales = l10nConfig.locales;
    }

    if (l10nConfig.defaultLocale) {
      this.defaultLocale = l10nConfig.defaultLocale;
    }
  }

  async _loadLocaleFile(locale) {
    let localeData;

    let localePath = this._staticAssetMap[locale];

    assert(
      `ember-l10n: Cannot find locale file path for locale "${locale}"`,
      Boolean(localePath)
    );

    try {
      localeData = await this._fetch(localePath);
    } catch (error) {
      console.error(`ember-l10n: Error trying to fetch locale ${locale}`);
      throw error;
    }

    let json = sanitizeJSON(localeData);

    let { translations: l10nTranslations } = json;

    this.l10nTranslations = l10nTranslations;
    this.pluralFactory = new PluralFactory(locale);
  }

  async _fetch(localePath) {
    let response = await fetch(localePath);
    return response.json();
  }

  _validateLocales() {
    assert(
      `ember-l10n: Do not use the locale zh, as it is not a valid locale. Instead, use dedicated locales for traditional & simplified Chinese.`,
      !this.availableLocales.some((locale) => locale === 'zh')
    );
  }
}
