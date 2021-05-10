'use strict';
const mergeTrees = require('broccoli-merge-trees');
const funnel = require('broccoli-funnel');
const LocaleJsonPlugin = require('./lib/locale-json-plugin');
const CreateAssetMapPlugin = require('./lib/create-asset-map-plugin');

const DEST_DIR = 'assets/locales';

module.exports = {
  name: require('./package').name,

  treeForPublic() {
    let localeTree = funnel(`${this.project.root}/translations`, {
      destDir: DEST_DIR,
    });

    let jsLocaleTree = new LocaleJsonPlugin(localeTree);
    let inventoryTree = new CreateAssetMapPlugin(localeTree, {
      destDir: DEST_DIR,
    });

    return mergeTrees([jsLocaleTree, inventoryTree]);
  },
};
