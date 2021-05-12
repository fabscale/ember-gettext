const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const glob = require('glob');
const gettextParser = require('gettext-parser');
const { parseJsFile } = require('./../utils/parse-js');
const { parseHbsFile } = require('./../utils/parse-hbs');
const { buildPoFile } = require('../utils/build-po-file');
const { processJSON } = require('./../utils/process-json');

module.exports = {
  name: 'gettext:extract',
  works: 'insideProject',
  description:
    'Extract translation messages from your app, from .js, .ts and .hbs files.',

  availableOptions: [
    {
      name: 'input-dirs',
      type: Array,
      aliases: ['i'],
      default: ['./app'],
      description: 'The directory(s) from which to extract the messages',
    },
    {
      name: 'output-dir',
      type: String,
      aliases: ['o'],
      default: './translations',
      description: 'Output directory of the PO-files',
    },
    {
      name: 'locale',
      type: String,
      aliases: ['l'],
      default: 'en',
      description: 'Locale of the message ids that are extracted.',
    },
    {
      name: 'include-patterns',
      type: Array,
      aliases: ['ip'],
      default: [],
      description:
        'List of regex patterns to include for extraction. Defaults to all files.',
    },
    {
      name: 'skip-patterns',
      type: Array,
      aliases: ['sp'],
      default: ['mirage'],
      description:
        'List of regex patterns to completely ignore from extraction',
    },
    {
      name: 'skip-dependencies',
      type: Array,
      aliases: ['sd'],
      default: [],
      description: 'An array of dependency names to exclude from parsing.',
    },
    {
      name: 'pot-name',
      type: String,
      default: 'messages.pot',
      description: 'The name of generated POT-file',
    },
    {
      name: 'print-changes',
      type: Boolean,
      default: false,
      description:
        'Print the changed message strings. If false, only show the changed count.',
    },
  ],

  async run(options) {
    let packageName = this.project.name();
    let { version } = this.project.pkg;

    let includeRegex = makePatternRegex(options.includePatterns);
    let skipRegex = makePatternRegex(options.skipPatterns);

    let {
      potName,
      inputDirs,
      outputDir,
      skipDependencies,
      locale,
      printChanges,
    } = options;

    // parse `node_modules` and add all packages which have a dependency for `ember-l10n`
    // This modifies the given inputDirs
    parseAddons(inputDirs, this.project.addonPackages, { skipDependencies });

    // run JS and HBS extractions
    let messageGettextItems = [];

    extractFromJS(messageGettextItems, {
      inputDirs,
      includeRegex,
      skipRegex,
      ui: this.ui,
    });

    extractFromHBS(messageGettextItems, {
      inputDirs,
      includeRegex,
      skipRegex,
      ui: this.ui,
    });

    // Generate POT file (=message template file without message strings)
    let potFilePath = path.join(outputDir, potName);

    // Fetch existing file to get difference
    let existingPotJSON;

    try {
      let existingPotFileContent = fs.readFileSync(potFilePath, 'utf-8');
      existingPotJSON = gettextParser.po.parse(existingPotFileContent);
      processJSON(existingPotJSON, { minimize: false });
    } catch (error) {
      // ignore
    }

    await generatePoFile(messageGettextItems, {
      withMessages: false,
      targetFileName: potFilePath,
      ui: this.ui,
      packageName,
      version,
      locale,
    });

    // Generate new JSON to get difference
    let newPotFileContent = fs.readFileSync(potFilePath, 'utf-8');
    let newPotJSON = gettextParser.po.parse(newPotFileContent);
    processJSON(newPotJSON, { minimize: false });

    let { newTerms, obsoleteTerms } = getPotChanges(
      existingPotJSON,
      newPotJSON
    );

    // Generate PO file (=base translation file with filled message strings)
    let poFilePath = path.join(outputDir, `${locale}.po`);
    await generatePoFile(messageGettextItems, {
      fillMessageStrings: true,
      targetFileName: poFilePath,
      ui: this.ui,
      packageName,
      version,
      locale,
    });

    if (printChanges) {
      this.ui.writeLine(chalk.bold(`\nNew terms:`));
      newTerms.forEach((term) => {
        this.ui.writeLine(chalk.dim(` • ${term}`));
      });

      if (newTerms.length === 0) {
        this.ui.writeLine(chalk.dim(' -'));
      }

      this.ui.writeLine(chalk.bold(`\nObsolete terms:`));
      obsoleteTerms.forEach((term) => {
        this.ui.writeLine(chalk.dim(` • ${term}`));
      });

      if (obsoleteTerms.length === 0) {
        this.ui.writeLine(chalk.dim(' -'));
      }

      this.ui.writeLine('');
    } else {
      this.ui.writeLine(
        chalk.bold(
          `\n${newTerms.length} new term(s) added, ${obsoleteTerms.length} term(s) obsolete\n`
        )
      );
    }
  },
};

function parseAddons(inputDirs, addons, { skipDependencies }) {
  Object.keys(addons).forEach((addonName) => {
    let addon = addons[addonName];
    checkAddon(inputDirs, addon, { skipDependencies });
  });
}

function checkAddon(inputDirs, addon, { skipDependencies }) {
  let l10nAddonName = '@gettext-parser/ember-l10n';
  let addonName = addon?.name;

  if (
    !addonName ||
    addonName === l10nAddonName ||
    skipDependencies.includes(addonName)
  ) {
    return;
  }

  let dependencies = addon.pkg?.dependencies || {};

  if (dependencies[l10nAddonName]) {
    let relativePath = path.relative('.', addon.path);
    inputDirs.push(`${relativePath}/addon`);
    inputDirs.push(`${relativePath}/app`);
  }
}

function makePatternRegex(patterns) {
  return patterns.length
    ? new RegExp(`(?:${patterns.join('|') || 'a^'})`, 'g')
    : null;
}

function extractFromJS(
  messageGettextItems,
  { inputDirs, includeRegex, skipRegex, ui }
) {
  let files = getFiles(inputDirs, '{js,ts}');
  let filteredFiles = filterFiles(files, { includeRegex, skipRegex });

  ui.writeLine(
    chalk.cyan.bold(`
========================================
EXTRACTING JS TRANSLATIONS
========================================
    `)
  );

  filteredFiles.forEach((file) => {
    ui.writeLine(chalk.white(`> ${file}`));

    parseJsFile(file, messageGettextItems);
  });

  ui.writeLine(
    chalk.green.bold(
      `\nExtracted ${filteredFiles.length} files (${
        files.length - filteredFiles.length
      } files skipped) ✔`
    )
  );
}

function extractFromHBS(
  messageGettextItems,
  { inputDirs, includeRegex, skipRegex, ui }
) {
  let files = getFiles(inputDirs, 'hbs');
  let filteredFiles = filterFiles(files, { includeRegex, skipRegex });

  ui.writeLine(
    chalk.cyan.bold(`
========================================
EXTRACTING HBS TRANSLATIONS
========================================
    `)
  );

  filteredFiles.forEach((file) => {
    ui.writeLine(chalk.white(`> ${file}`));

    parseHbsFile(file, messageGettextItems);
  });

  ui.writeLine(
    chalk.green.bold(
      `\nExtracted ${filteredFiles.length} files (${
        files.length - filteredFiles.length
      } files skipped) ✔`
    )
  );
}

async function generatePoFile(
  gettextItems,
  { targetFileName, ui, fillMessageStrings, packageName, version, locale }
) {
  let poContent = buildPoFile(gettextItems, {
    fillMessageStrings,
    packageName,
    version,
    locale,
  });

  await fs.ensureFile(targetFileName);
  await fs.writeFile(targetFileName, poContent, 'utf-8');

  ui.writeLine(chalk.green.bold(`\nUpdated ${targetFileName} ✔`));
}

function getFiles(inputDirs, extensions) {
  return inputDirs.reduce((files, dir) => {
    let normalizedPath = path.normalize(`${dir}/**/*.${extensions}`);
    let result = glob.sync(normalizedPath);

    return files.concat(result);
  }, []);
}

function filterFiles(files, { includeRegex, skipRegex }) {
  return files.filter(
    (file) =>
      (!includeRegex || file.match(includeRegex)) &&
      (!skipRegex || !file.match(skipRegex))
  );
}

function getPotChanges(existingPotJSON, newPotJSON) {
  let obsoleteTerms = [];
  let newTerms = [];

  let existingTranslations = existingPotJSON?.translations || {};
  let newTranslations = newPotJSON.translations;

  Object.keys(existingTranslations).forEach((context) => {
    Object.keys(existingTranslations[context]).forEach((messageId) => {
      if (!newTranslations[context]?.[messageId]) {
        obsoleteTerms.push(context ? `${context}::${messageId}` : messageId);
      }
    });
  });

  Object.keys(newTranslations).forEach((context) => {
    Object.keys(newTranslations[context]).forEach((messageId) => {
      if (!existingTranslations[context]?.[messageId]) {
        newTerms.push(context ? `${context}::${messageId}` : messageId);
      }
    });
  });

  return { newTerms, obsoleteTerms };
}
