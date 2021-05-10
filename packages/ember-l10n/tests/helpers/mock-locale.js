export function mockLocale(l10nService, translations, messageContext = '') {
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
}
