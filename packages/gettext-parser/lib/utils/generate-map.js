const fs = require('fs');
const path = require('path');

module.exports = function generateMap(localeDir) {
  let files = fs.readdirSync(localeDir);
  let indexFileName = 'index.js';
  let filesMap = [];

  files
    .filter((fileName) => fileName !== indexFileName)
    .forEach((fileName) => {
      let locale = fileName.replace('.json', '');

      filesMap.push(`  ${locale}: () => import('./${fileName}')`);
    });

  let mapFileContent = `/* eslint-disable */
// THIS FILE IS GENERATED BY @ember-gettext/gettext-parser
// DO NOT MODIFY THIS FILE YOURSELF - ANY CHANGE WILL BE OVERWRITTEN

const map = {
${filesMap.join(',\n')}
};  

export default map;
`;

  let mapFile = path.join(localeDir, indexFileName);
  fs.writeFileSync(mapFile, mapFileContent, 'utf-8');

  return mapFile;
};
