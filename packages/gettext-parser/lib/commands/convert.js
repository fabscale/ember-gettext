const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const gettextParser = require('gettext-parser');
const { processJSON } = require('./../utils/process-json');
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

    let validationErrors = validate(poFileJson, { locale });

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
