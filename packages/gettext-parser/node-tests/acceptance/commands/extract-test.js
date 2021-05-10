const { expect } = require('chai');
const path = require('path');
const fs = require('fs-extra');
const Command = require('ember-cli/lib/models/command');
const MockUI = require('console-ui/mock'); //eslint-disable-line
const ExtractCommand = require('./../../../lib/commands/extract');

const TMP_DIR = './tmp/ember-l10n-tests';

describe('extract command', function () {
  let project;

  this.timeout(100000);

  beforeEach(function () {
    project = {
      name() {
        return 'test-app';
      },
      pkg: {
        version: '0.1.0',
      },
      root: path.resolve('.'),
      addonPackages: {},
      hasDependencies() {
        return true;
      },
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

    let TestCommand = Command.extend(ExtractCommand);
    return new TestCommand(options);
  }

  it('messages.po file is correctly generated from scratch', async function () {
    let options = getOptions({});

    let cmd = createCommand();
    await cmd.run(options);

    let expectedFileContent = getPoFileContent(
      './node-tests/fixtures/extract/expected.pot'
    );

    let actualFileContent = getPoFileContent(
      './tmp/ember-l10n-tests/messages.pot'
    );

    expect(actualFileContent).to.equals(expectedFileContent);
  });

  it('messages.po file is correctly updated if one already exists', async function () {
    let options = getOptions({});

    // First put a dummy existing messages.po in the output folder
    fs.copyFileSync(
      './node-tests/fixtures/extract/base.pot',
      `${options.outputDir}/${options.potName}`
    );

    let cmd = createCommand();
    await cmd.run(options);

    // We want to ignore everything until the first comment
    let expectedFileContent = getPoFileContent(
      './node-tests/fixtures/extract/expected.pot'
    );
    let actualFileContent = getPoFileContent(
      './tmp/ember-l10n-tests/messages.pot'
    );

    expect(actualFileContent).to.equals(expectedFileContent);
  });

  it('correctly handles --include-patterns & --skip-patterns', async function () {
    let options = getOptions({
      sourceDirs: ['./node-tests'],
      includePatterns: ['fixtures'],
      skipPatterns: ['convert', 'extract', 'parse-hbs', 'parse-js'],
    });

    let cmd = createCommand();
    await cmd.run(options);

    let expectedFileContent = getPoFileContent(
      './node-tests/fixtures/extract/expected.pot'
    );
    let actualFileContent = getPoFileContent(
      './tmp/ember-l10n-tests/messages.pot'
    );

    expect(actualFileContent).to.equals(expectedFileContent);
  });
});

function getOptions(options = {}) {
  return Object.assign(
    {
      potName: 'messages.pot',
      inputDirs: ['./node-tests/fixtures/test-app/app'],
      outputDir: TMP_DIR,
      skipDependencies: [],
      locale: 'en',
      includePatterns: [],
      skipPatterns: [],
    },
    options
  );
}

function getPoFileContent(filePath) {
  // We want to ignore everything until the first comment
  let fileContent = fs.readFileSync(filePath, 'UTF-8');
  return fileContent.substr(fileContent.indexOf('#: '));
}
