const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const gettextParser = require('gettext-parser');
const { processJSON } = require('./../utils/process-json');
const { validate } = require('./../utils/validate-json');
const generateMap = require('./../utils/generate-map');
const parsePluralFormsCount = require('./../utils/parse-plural-forms');

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
      default: './app/locales',
      description: 'Output directory where to store the generated .json file',
    },
    {
      name: 'locale',
      type: String,
      aliases: ['l'],
      default: undefined,
      description:
        'Locale of the .po file to convert. If none is given, converts all locales.',
    },
    {
      name: 'input-file',
      type: String,
      aliases: ['if'],
      default: undefined,
      description:
        'Optional full path of a .po file to convert - if given, takes precedent over input-dir',
    },
    {
      name: 'generate-map',
      type: Boolean,
      aliases: ['m'],
      default: true,
      description: 'If the import map should be generated for all locales',
    },
  ],

  async run(options) {
    let {
      inputDir,
      outputDir,
      locale,
      inputFile,
      generateMap: shouldGenerateMap,
    } = options;

    if (locale) {
      let fullInputPath = inputFile || path.join(inputDir, `${locale}.po`);

      await this.convertLocale({ locale, fullInputPath, outputDir });
    } else {
      // Else, iterate over all locale files
      this.ui.writeLine(chalk.bold('Converting all locales...'));
      let localeFiles = fs.readdirSync(inputDir);

      for (let localeFile of localeFiles) {
        if (!localeFile.endsWith('.po')) {
          continue;
        }

        this.ui.writeLine(`\n\n > Found locale file: ${localeFile}`);

        let locale = localeFile.replace('.po', '');
        let fullInputPath = path.join(inputDir, localeFile);
        await this.convertLocale({ locale, fullInputPath, outputDir });
      }
    }

    if (shouldGenerateMap) {
      let mapFile = generateMap(outputDir);

      this.ui.writeLine(
        chalk.green.bold(
          `\n\nMap file was successfully generated at ${mapFile} ✔`
        )
      );
    }
  },

  async convertLocale({ outputDir, locale, fullInputPath }) {
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

    let pluralFormsCount = parsePluralFormsCount(
      poFileJson.headers['plural-forms']
    );

    // Cleanup JSON output
    let headers = {
      locale,
      'json-creation-date': new Date().toISOString(),
      'plural-forms-count': pluralFormsCount,
    };
    poFileJson.headers = headers;
    delete poFileJson.charset;

    printValidationErrors(validationErrors, { ui: this.ui });

    if (validationErrors.some((error) => error.level === 'ERROR')) {
      this.ui.writeLine(
        chalk.red(
          '\n\nValidation of JSON was not successful - .js file was not generated.'
        )
      );
      return;
    }

    let fileContent = JSON.stringify(poFileJson, null, 2);

    await fs.ensureFile(fullOutputPath);
    await fs.writeFile(fullOutputPath, fileContent, 'utf8');

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
