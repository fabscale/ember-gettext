const { expect } = require('chai');
const path = require('path');
const fs = require('fs-extra');
const Command = require('ember-cli/lib/models/command');
const MockUI = require('console-ui/mock'); // eslint-disable-line
const ConvertCommand = require('./../../../lib/commands/convert');

const TMP_DIR = './tmp/ember-l10n-tests';

function readJSONFromFile(fileName) {
  let fileContent = fs.readFileSync(fileName, 'UTF-8');
  return JSON.parse(fileContent);
}

describe('convert command', function () {
  let project;

  this.timeout(100000);

  beforeEach(function () {
    project = {
      root: path.resolve('.'),
      isEmberCLIProject() {
        return true;
      },
    };

    fs.ensureDirSync(TMP_DIR);
  });

  afterEach(function () {
    fs.removeSync(TMP_DIR);
  });

  function createCommand(options = {}) {
    Object.assign(options, {
      ui: new MockUI(),
      project,
      environment: {},
      settings: {},
    });

    let TestCommand = Command.extend(ConvertCommand);
    return new TestCommand(options);
  }

  it('it correctly converts a po file', async function () {
    let options = getOptions({});

    // First put the example en.po in the output folder
    fs.copyFileSync('./node-tests/fixtures/convert/en.po', `${TMP_DIR}/en.po`);

    let cmd = createCommand();
    await cmd.run(options);

    let actualFileContent = readJSONFromFile('./tmp/ember-l10n-tests/en.json');
    let expectedFileContent = readJSONFromFile(
      './node-tests/fixtures/convert/expected.json'
    );

    delete actualFileContent.headers['json-creation-date'];
    delete expectedFileContent.headers['json-creation-date'];

    expect(actualFileContent).to.deep.equals(expectedFileContent);

    // Ensure order of props is correct as well
    let actualNamespaces = Object.keys(actualFileContent.translations);
    let expectedNamespaces = Object.keys(expectedFileContent.translations);

    expect(actualNamespaces).to.deep.equal(
      expectedNamespaces,
      'namespace sorting is correct'
    );

    actualNamespaces.forEach((namespace) => {
      let actualItems = Object.keys(actualFileContent.translations[namespace]);
      let expectedItems = Object.keys(
        expectedFileContent.translations[namespace]
      );
      expect(actualItems).to.deep.equal(
        expectedItems,
        `item sorting for namespace ${namespace} is correct`
      );
    });
  });

  it('it allows to specify a full input file path', async function () {
    let options = getOptions({
      inputFile: `${TMP_DIR}/custom.po`,
    });

    // First put the example en.po in the output folder
    fs.copyFileSync(
      './node-tests/fixtures/convert/en.po',
      `${TMP_DIR}/custom.po`
    );

    let cmd = createCommand();
    await cmd.run(options);

    let actualFileContent = readJSONFromFile('./tmp/ember-l10n-tests/en.json');
    let expectedFileContent = readJSONFromFile(
      './node-tests/fixtures/convert/expected.json'
    );

    delete actualFileContent.headers['json-creation-date'];
    delete expectedFileContent.headers['json-creation-date'];

    expect(actualFileContent).to.deep.equals(expectedFileContent);
  });
});

function getOptions(options = {}) {
  return Object.assign(
    {
      inputDir: TMP_DIR,
      outputDir: TMP_DIR,
      locale: 'en',
    },
    options
  );
}
