'use strict';

module.exports = {
  name: require('./package').name,

  includedCommands() {
    return {
      'l10n:extract': require('./lib/commands/extract'),
    };
  },
};
