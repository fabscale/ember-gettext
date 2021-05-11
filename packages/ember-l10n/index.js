'use strict';
const funnel = require('broccoli-funnel');
const CreateLocaleAssetMap = require('./lib/create-locale-asset-map');

const DEST_DIR = 'assets/locales';

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);

    this._fixFingerprintingSettings();
  },

  treeForPublic() {
    let localeTree = funnel(this._getTranslationsFolder(), {
      destDir: DEST_DIR,
      include: ['*.json'],
    });

    return localeTree;
  },

  setupPreprocessorRegistry(type, registry) {
    if (type !== 'self') {
      return;
    }

    let translationsFolder = this._getTranslationsFolder();
    registry.add('js', new CreateLocaleAssetMap({ translationsFolder }));
  },

  _fixFingerprintingSettings() {
    let app = this._findHost();

    // Fix fingerprinting options to work
    if (
      app.options?.fingerprint?.enabled !== false &&
      app.project.findAddonByName('broccoli-asset-rev')
    ) {
      let fingerprintOptions = app.options.fingerprint;

      let infoMessages = [];

      // Ensure .json files are fingerprinted
      if (!fingerprintOptions.extensions) {
        // eslint-disable-next-line node/no-unpublished-require
        let opts = require('broccoli-asset-rev/lib/default-options');

        let extensions = opts.extensions.slice().concat(['json']);

        infoMessages.push(
          `set fingerprint.extensions = ${JSON.stringify(extensions)}`
        );
      } else if (!fingerprintOptions.extensions.includes('json')) {
        fingerprintOptions.extensions.push('json');
        infoMessages.push("added 'json' to fingerprint.extensions");
      }

      if (app.project.findAddonByName('ember-cli-fastboot')) {
        // Ensure package.json is NOT fingerprinted (this is added by fastboot)
        let excluded = fingerprintOptions.exclude || [];
        fingerprintOptions.exclude = excluded;

        if (!excluded.includes('package.json')) {
          excluded.push('package.json');
          infoMessages.push("added 'package.json' to fingerprint.exclude");
        }
      }

      if (infoMessages.length > 0) {
        this.ui.writeLine('');
        this.ui.writeLine(
          'ember-l10n automatically adjusted the fingerprinting settings to work properly:'
        );
        infoMessages.forEach((message) => this.ui.writeLine(`* ${message}`));
        this.ui.writeLine('');
      }
    }
  },

  _getTranslationsFolder() {
    return `${this.project.root}/translations`;
  },
};
