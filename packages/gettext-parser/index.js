'use strict';

module.exports = {
  name: require('./package').name,

  includedCommands() {
    return {
      'gettext:extract': require('./lib/commands/extract'),
      'gettext:convert': require('./lib/commands/convert'),
    };
  },
};
