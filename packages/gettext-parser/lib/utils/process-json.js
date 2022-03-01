const { traverseJson } = require('./../utils/traverse-json');

function processJSON(json, { minimize = true } = {}) {
  let untranslatedItemCount = 0;

  // Delete `obsolete` object, as we don't need that
  delete json.obsolete;

  traverseJson(json, (item, namespace, id) => {
    // If the item is not translated, remove it
    if (minimize && (!item.msgstr || !item.msgstr[0])) {
      untranslatedItemCount++;
      delete namespace[id];
      return;
    }

    // If the translation is the same as the ID (e.g. for the source language), also remove it
    // We use the ID by default anyhow, so this will reduce the size of the JSON for the default language
    if (
      item.msgid === item.msgstr[0] &&
      (!item.msgid_plural || item.msgid_plural === item.msgstr[1]) &&
      minimize
    ) {
      delete namespace[id];
      return;
    }

    // Remove comments, as we don't need them
    delete item.comments;

    // Fix curly single/double quotes, to ensure translations work
    fixCurlyQuotes(item);
  });

  // Delete info-item in translations (if it exists)
  if (json.translations[''] && json.translations['']['']) {
    delete json.translations[''][''];
  }

  // Ensure headers have lower-case keys
  // NOTE: Starting with gettext-parser@3, these are title cased (e.g. "Plural-Forms")
  // But we have been using lower cased ones, and rely on it for the plural-forms
  // So for consistency, we convert them all to lower case here
  let headers = {};
  Object.keys(json.headers).forEach((header) => {
    headers[header.toLowerCase()] = json.headers[header];
  });

  json.headers = headers;

  // Ensure plural form has trailing `;`
  if (json.headers['plural-forms']) {
    let pluralForm = json.headers['plural-forms'];
    if (!pluralForm.endsWith(';')) {
      json.headers['plural-forms'] = `${pluralForm};`;
    }
  }

  // Ensure it is sorted consistently (by message id)
  sortJSON(json);

  return { untranslatedItemCount };
}

function fixCurlyQuotes(item) {
  let doubleQuoteRegex = /[“|”]/gm;
  let singleQuoteRegex = /[‘|’]/gm;

  item.msgstr = item.msgstr.map((str) => {
    return str.replace(doubleQuoteRegex, '"').replace(singleQuoteRegex, "'");
  });
}

function sortJSON(json) {
  let { translations } = json;

  Object.keys(translations)
    .sort((a, b) => a.localeCompare(b))
    .forEach((namespace) => {
      let sortedNamespace = {};

      Object.keys(translations[namespace])
        .sort((a, b) => a.localeCompare(b))
        .forEach((k) => {
          sortedNamespace[k] = translations[namespace][k];
        });

      delete translations[namespace];
      translations[namespace] = sortedNamespace;
    });
}

module.exports = {
  processJSON,
};
