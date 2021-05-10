const Filter = require('broccoli-persistent-filter');

module.exports = class LocaleJsonPlugin extends Filter {
  constructor(inputNode, options = {}) {
    super(inputNode, {
      annotation: options.annotation,
    });

    this.extensions = ['json'];
    this.targetExtension = 'js';
  }

  processString(content) {
    return 'export default ' + content + ';';
  }
};
