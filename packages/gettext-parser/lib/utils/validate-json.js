const { validatePlaceholders } = require('./validate/validate-placeholders');
const {
  validateTranslatedPlaceholders,
} = require('./validate/validate-translated-placeholders');
const { traverseJson } = require('./traverse-json');
const { validatePluralForms } = require('./validate/validate-plural-forms');
const {
  validatePluralFormFormat,
} = require('./validate/validate-plural-form-format');

function validate(json, { locale }) {
  let validationErrors = [];

  // Validate if plural form handling works properly
  let pluralForm = json.headers['plural-forms'];
  validatePluralFormFormat(pluralForm, locale);

  let pluralRules = new Intl.PluralRules(locale);
  let { pluralCategories } = pluralRules.resolvedOptions();

  traverseJson(json, (item) =>
    validateItem(item, { pluralCategories }, validationErrors)
  );
  return validationErrors;
}

function validateItem(item, { pluralCategories }, validationErrors) {
  let { msgid: id, msgid_plural: idPlural, msgstr: translations } = item;

  validatePlaceholders({ id, idPlural, translations }, validationErrors);
  validateTranslatedPlaceholders({ id, translations }, validationErrors);
  validatePluralForms(
    { id, idPlural, translations, pluralCategories },
    validationErrors
  );
}

module.exports = {
  validate,
  validateItem,
};
