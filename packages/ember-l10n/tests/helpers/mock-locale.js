import { PluralFactory } from '@ember-gettext/ember-l10n/utils/plural-factory';

export function mockLocale(
  l10nService,
  translations,
  messageContext = '',
  { locale } = { locale: 'en' }
) {
  let poTranslations = {};

  Object.keys(translations).forEach((msgid) => {
    let msgstr = translations[msgid];

    poTranslations[msgid] = {
      msgid,
      msgstr: Array.isArray(msgstr) ? msgstr : [msgstr],
    };
  });

  l10nService.l10nTranslations = Object.assign(
    {},
    l10nService.l10nTranslations,
    {
      [messageContext]: poTranslations,
    }
  );

  l10nService.locale = locale;
  l10nService.pluralFactory = new PluralFactory(locale);
}
