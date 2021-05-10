const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const glob = require('glob');
const { parseJsFile } = require('./../utils/parse-js');
const { parseHbsFile } = require('./../utils/parse-hbs');
const { buildPoFile } = require('../utils/build-po-file');

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
  ],

  async run(options) {
    let packageName = this.project.name();
    let { version } = this.project.pkg;

    let startTime = +new Date();

    let includeRegex = makePatternRegex(options.includePatterns);
    let skipRegex = makePatternRegex(options.skipPatterns);

    let { potName, inputDirs, outputDir, skipDependencies, locale } = options;

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
    await generatePoFile(messageGettextItems, {
      withMessages: false,
      targetFileName: potFilePath,
      ui: this.ui,
      packageName,
      version,
      locale,
    });

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

    let endTime = +new Date();
    let duration = endTime - startTime;

    this.ui.writeLine(
      chalk.green.bold(
        `\n\nTime to complete: ${(duration / 1000).toFixed(2)} seconds`
      )
    );
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
