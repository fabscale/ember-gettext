// find all: {{#1}}message{{/1}}
const regex = /{{#\s*(\d+)\s*}}(.*){{\/\s*(\1+)\s*}}/gm;

/**
 * Validate the translated (complex) placeholders of an item.
 * This mutates the given validationErrors.
 *
 * @method _validateTranslatedPlaceholders
 * @param {String} id
 * @param {String[]} translations
 * @private
 */
function validateTranslatedPlaceholders(
  { id, translations },
  validationErrors
) {
  // Build an object describing the complex placeholders from the original string
  let placeholders = id.match(regex) || [];

  if (!placeholders.length) {
    return;
  }

  let placeholderConfig = placeholders.map((str) => parseStringForRegex(str));

  translations.forEach((translation) => {
    // If the item is not translated at all, ignore it
    if (!translation) {
      return;
    }

    // Build an object describing the complex placeholders from the translated string
    let translatedPlaceholders = translation.match(regex) || [];
    let translatedPlaceholderConfig = translatedPlaceholders.map((str) =>
      parseStringForRegex(str)
    );

    checkTranslatedPlaceholders(
      validationErrors,
      { id, translation },
      placeholderConfig,
      translatedPlaceholderConfig
    );
  });
}

function parseStringForRegex(str) {
  regex.lastIndex = 0;
  let [fullResult, placeholder, content, closingPlaceholder] = regex.exec(str);

  return {
    fullResult,
    placeholder,
    content,
    closingPlaceholder,
  };
}

function checkTranslatedPlaceholders(
  validationErrors,
  { id, translation },
  placeholderConfig,
  translatedPlaceholderConfig
) {
  placeholderConfig.forEach(({ placeholder, content }) => {
    // First we check for missing/invalid placeholders
    if (
      !translatedPlaceholderConfig.find(
        (config) => config.placeholder === placeholder
      )
    ) {
      validationErrors.push({
        id,
        translation,
        message: `The complex placeholder "${placeholder}" is not correctly translated`,
        level: 'ERROR',
      });
      return;
    }

    // Then, we check if the placeholder content is correctly translated
    // If the whole string is not translated at all, we ignore it
    // Only if the string is translated but the placeholder part not will this show a warning
    // NOTE: This is just a warning (not an error), as it is theoretically possible this is done on purpose
    // E.g. a word _might_ be the same in translated form
    if (id === translation) {
      return;
    }

    let invalidTranslatedPlaceholder = translatedPlaceholderConfig.find(
      (config) => {
        return config.content === content;
      }
    );

    if (invalidTranslatedPlaceholder) {
      validationErrors.push({
        id,
        translation,
        message: `The content "${content}" for complex placeholder "${placeholder}" is not translated`,
        level: 'WARNING',
      });
    }
  });
}

module.exports = {
  validateTranslatedPlaceholders,
};
