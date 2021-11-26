const chalk = require('chalk');
const generateMap = require('./../utils/generate-map');

module.exports = {
  name: 'gettext:generate-map',
  works: 'insideProject',
  description: 'Generate a map of locale files to allow easy lookup.',

  availableOptions: [
    {
      name: 'locale-dir',
      type: String,
      aliases: ['d'],
      default: './app/locales',
      description:
        'The directory where the input locale .json files are located',
    },
  ],

  async run(options) {
    let { localeDir } = options;

    let mapFile = generateMap(localeDir);

    this.ui.writeLine(
      chalk.green.bold(
        `\n\nMap file was successfully generated at ${mapFile} ✔`
      )
    );
  },
};
