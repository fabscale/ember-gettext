import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import {
  replacePlaceholders,
  sanitizeMessageId,
  sanitizeJSON,
  setupPluralFactory,
  getMessages,
} from '@ember-gettext/ember-l10n/utils/message-utils';

export default class L10nService extends Service {
  @tracked locale;
  @tracked l10nTranslations;
  @tracked pluralFactory;

  // Configured via environment.js ['@ember-gettext/ember-l10n']
  defaultLocale = 'en';
  defaultPluralForm = 'nplurals=2; plural=(n != 1);';
  availableLocales = ['en'];

  _localeModuleMap;

  constructor() {
    super(...arguments);

    let config = getOwner(this).resolveRegistration('config:environment');
    let l10nConfig = config['@ember-gettext/ember-l10n'];
    this._loadConfig(l10nConfig);

    this._validateLocales();

    let { defaultLocale, defaultPluralForm } = this;

    this.pluralFactory = setupPluralFactory(
      defaultPluralForm,
      defaultPluralForm
    );
    this.locale = defaultLocale;
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

    let { pluralFactory } = this;

    let messageId = sanitizeMessageId(msgId);

    let messages = getMessages(this.l10nTranslations, messageId, msgContext);

    assert(
      `ember-l10n: No plural factory is loaded`,
      typeof pluralFactory === 'function'
    );

    let messageIndex = pluralFactory(count);

    let message =
      messages[messageIndex] || (messageIndex === 0 ? msgId : msgIdPlural);

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

    if (l10nConfig.defaultPluralForm) {
      this.defaultPluralForm = l10nConfig.defaultPluralForm;
    }
  }

  async _loadLocaleFile(locale) {
    await this._ensureLocaleModuleMapIsLoaded();

    let localeFilePath = this._getLocaleFilePath(locale);

    if (!localeFilePath) {
      throw new Error(
        `ember-l10n: Cannot find locale file path for locale "${locale}"`
      );
    }

    let localeData;
    try {
      let localeDataModule = await this._loadImport(localeFilePath);
      localeData = localeDataModule.default;
    } catch (error) {
      console.error(
        `ember-l10n: Error trying to fetch locale module ${localeFilePath} for locale ${locale}`
      );
      throw error;
    }

    let json = sanitizeJSON(localeData);

    let {
      headers: { 'plural-forms': pluralForm },
      translations: l10nTranslations,
    } = json;

    this.l10nTranslations = l10nTranslations;
    this.pluralFactory = setupPluralFactory(pluralForm, this.defaultPluralForm);
  }

  async _ensureLocaleModuleMapIsLoaded() {
    try {
      let assetMapModule = await this._loadImport(
        /* webpackIgnore: true */ '/assets/locales/index.js'
      );
      this._localeModuleMap = assetMapModule.default;
    } catch (error) {
      console.error(`ember-l10n: Error trying to fetch locale module map`);
      console.error(error);
    }
  }

  _getLocaleFilePath(locale) {
    return this._localeModuleMap?.[locale];
  }

  _loadImport(filePath) {
    return import(/* webpackIgnore: true */ filePath);
  }

  _validateLocales() {
    assert(
      `ember-l10n: Do not use the locale zh, as it is not a valid locale. Instead, use dedicated locales for traditional & simplified Chinese.`,
      !this.availableLocales.some((locale) => locale === 'zh')
    );
  }
}
