const Filter = require('broccoli-persistent-filter');
const mergeTrees = require('broccoli-merge-trees');
const funnel = require('broccoli-funnel');
const path = require('path');
const fs = require('fs');

module.exports = class CreateLocaleAssetMap {
  name = 'ember-l10n-locale-plugin';

  constructor({ translationsFolder }) {
    this.translationsFolder = translationsFolder;
  }

  toTree(tree) {
    let l10nServiceTree = funnel(tree, {
      include: ['@ember-gettext/ember-l10n/services/l10n.js'],
    });

    let l10nServiceTreeWithAssetMap = new AddStaticImportPathsPlugin(
      l10nServiceTree,
      {
        annotation: 'ember-l10n-locale-plugin process locale assets',
        translationsFolder: this.translationsFolder,
      }
    );

    return mergeTrees([tree, l10nServiceTreeWithAssetMap], { overwrite: true });
  }
};

class AddStaticImportPathsPlugin extends Filter {
  constructor(inputNode, options = {}) {
    super(inputNode, {
      annotation: options.annotation,
    });

    this.extensions = ['js'];
    this.targetExtension = 'js';

    let locales = fs
      .readdirSync(options.translationsFolder)
      .filter((filePath) => filePath.endsWith('.json'))
      .map((filePath) => path.basename(filePath, '.json'));

    let staticAssetMap = {};
    locales.forEach((locale) => {
      staticAssetMap[locale] = `/assets/locales/${locale}.json`;
    });
    this.staticAssetMap = staticAssetMap;
  }

  processString(content) {
    return content.replace(
      '_staticAssetMap;',
      `_staticAssetMap = ${JSON.stringify(this.staticAssetMap)};`
    );
  }
}
