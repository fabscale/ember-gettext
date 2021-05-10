const Plugin = require('broccoli-plugin');
const path = require('path');

module.exports = class CreateAssetMapPlugin extends Plugin {
  constructor(inputNode, { destDir }) {
    super([inputNode], {});

    this.destDir = destDir;
  }

  build() {
    this.parseInput();
  }

  parseInput() {
    let filePaths = this.parseDirectory('./', []);

    let assetMap = {};

    filePaths.forEach((filePath) => {
      let locale = path.basename(filePath, '.js');
      assetMap[locale] = `/${path.relative('.', filePath)}`;
    });

    this.output.mkdirSync(this.destDir, { recursive: true });
    this.output.writeFileSync(
      path.join(this.destDir, 'index.js'),
      `export default ${JSON.stringify(assetMap)};`
    );
  }

  parseDirectory(dirName, fileNames) {
    let files = this.input.readdirSync(dirName);

    files.forEach((fileName) => {
      let fullFileName = `${dirName}/${fileName}`;

      if (this.input.statSync(fullFileName).isFile()) {
        fileNames.push(
          `${path.dirname(fullFileName)}/${path.basename(
            fullFileName,
            '.json'
          )}.js`
        );
      } else {
        this.parseDirectory(fullFileName, fileNames);
      }
    });

    return fileNames;
  }
};
