const Filter = require('broccoli-persistent-filter');

module.exports = class LocaleJsonPlugin extends Filter {
  constructor(inputNode, options = {}) {
    super(inputNode, {
      annotation: options.annotation,
    });

    this.extensions = ['json'];
    this.targetExtension = 'js';
  }

  cacheKey2() {
    // return md5(Filter.prototype.call(this) + inputOptionsChecksum + dependencyVersionChecksum);
  }

  processString(content) {
    return 'export default ' + content + ';';
  }
};
