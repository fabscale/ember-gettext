function validatePluralForms(
  { id, idPlural, translations, pluralCategories },
  validationErrors
) {
  if (idPlural && translations.length !== pluralCategories.length) {
    validationErrors.push({
      id,
      translation: JSON.stringify(translations),
      message: `The number of plural forms does not match the expected amount. 
expected forms: ${JSON.stringify(pluralCategories)}`,
      level: 'WARNING',
    });
  }
}

module.exports = {
  validatePluralForms,
};
