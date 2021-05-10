const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
let gettextParser = require('gettext-parser');
const { traverseJson } = require('./../utils/traverse-json');
const { validate } = require('./../utils/validate-json');

module.exports = {
  name: 'gettext:convert',
  works: 'insideProject',
  description: 'Convert a .po file to a .json file usable by ember-l10n',

  availableOptions: [
    {
      name: 'input-dir',
      type: String,
      aliases: ['i'],
      default: './translations',
      description: 'The directory where the input .po file is located',
    },
    {
      name: 'output-dir',
      type: String,
      aliases: ['o'],
      default: './translations',
      description: 'Output directory where to store the generated .json file',
    },
    {
      name: 'locale',
      type: String,
      aliases: ['l'],
      default: 'en',
      description: 'Locale of the .po file to convert.',
    },
    {
      name: 'input-file',
      type: String,
      aliases: ['if'],
      default: undefined,
      description:
        'Optional full path of a .po file to convert - if given, takes precedent over input-dir',
    },
  ],

  async run(options) {
    let { inputDir, outputDir, locale, inputFile } = options;

    let fullInputPath = inputFile || path.join(inputDir, `${locale}.po`);
    let fullOutputPath = path.join(outputDir, `${locale}.json`);

    if (!fs.existsSync(fullInputPath)) {
      this.ui.writeLine(
        chalk.red.bold(`PO file ${fullInputPath} does not exist!`)
      );
      return;
    }

    let poFileContent = fs.readFileSync(fullInputPath, 'utf-8');
    let poFileJson = gettextParser.po.parse(poFileContent);

    // This modified the json in-place
    let { untranslatedItemCount } = processJSON(poFileJson);

    if (untranslatedItemCount > 0) {
      this.ui.writeLine(
        chalk.yellow(
          `${untranslatedItemCount} messages have not been translated - skipping them in the generated JSON file...`
        )
      );
      this.ui.writeLine('');
    }

    let validationErrors = validate(poFileJson);

    printValidationErrors(validationErrors, { ui: this.ui });

    if (validationErrors.some((error) => error.level === 'ERROR')) {
      this.ui.writeLine(
        chalk.red(
          '\n\nValidation of JSON was not successful - .json file was not generated.'
        )
      );
      return;
    }

    let strData = JSON.stringify(poFileJson, null, 2);
    await fs.ensureFile(fullOutputPath);
    await fs.writeFile(fullOutputPath, strData, 'utf8');

    this.ui.writeLine(
      chalk.green.bold(`\n\n${fullOutputPath} was successfully generated ✔`)
    );
  },
};

function processJSON(json) {
  let untranslatedItemCount = 0;

  traverseJson(json, (item, namespace, id) => {
    // If the item is not translated, remove it
    if (!item.msgstr || !item.msgstr[0]) {
      untranslatedItemCount++;
      delete namespace[id];
      return;
    }

    // If the translation is the same as the ID (e.g. for the source language), also remove it
    // We use the ID by default anyhow, so this will reduce the size of the JSON for the default language
    if (
      item.msgid === item.msgstr[0] &&
      (!item.msgid_plural || item.msgid_plural === item.msgstr[1])
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

function printValidationErrors(errors, { ui }) {
  errors.forEach(({ id, translation, message, level }) => {
    level = level.toUpperCase();
    let color = level === 'ERROR' ? 'red' : 'yellow';
    let label = level === 'ERROR' ? 'Validation error' : 'Validation warning';

    ui.writeLine(chalk[color].bold(`${label} for "${id}":`));
    ui.writeLine(chalk[color](`   Translation: "${translation}"`));
    ui.writeLine(chalk[color](`   Problem: ${message}`));
  });
}
