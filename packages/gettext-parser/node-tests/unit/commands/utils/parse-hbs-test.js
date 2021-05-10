const { expect } = require('chai');
const { parseHbsFile } = require('./../../../../lib/utils/parse-hbs');

describe('parseHbsFile util', function () {
  it('it correctly parses t helper', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 2,
        },
        messageId: 'test content',
      },
    ]);
  });

  it('it correctly parses n helper', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/n.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 2,
        },
        messageId: 'test content singular',
        messageIdPlural: 'test content plural',
      },
    ]);
  });

  it('it correctly parses indented n helper', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/n-indented.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 2,
        },
        messageId: 'test content singular',
        messageIdPlural: 'test content plural',
      },
    ]);
  });

  it('it correctly parses t helper with context', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-with-context.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 2,
        },
        messageId: 'test content',
        messageContext: 'test context',
      },
    ]);
  });

  it('it correctly parses n helper with context', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/n-with-context.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 2,
        },
        messageId: 'test content singular',
        messageIdPlural: 'test content plural',
        messageContext: 'test context',
      },
    ]);
  });

  it('it correctly parses multiline t helper', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-multiline.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 2,
        },
        messageId: `test content
    across multiple lines
    goes here`,
      },
    ]);
  });

  it('it correctly parses t helper in hash', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-in-hash.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 7,
          column: 9,
        },
        messageId: 'test content',
      },
    ]);
  });

  it('it correctly parses t helper in positional argument', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-in-positional-arg.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 10,
        },
        messageId: 'test content',
      },
    ]);
  });

  it('it correctly parses t helper with placeholders', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-with-placeholder.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 2,
        },
        messageId: 'test content {{placeholder}}',
      },
    ]);
  });

  it('it correctly parses t helper as argument for yielded component', function () {
    let gettextItems = [];
    let fileName =
      './node-tests/fixtures/parse-hbs/t-for-yielded-component.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 7,
          column: 12,
        },
        messageId: 'test content',
      },
    ]);
  });

  it('it correctly parses t helper in yielded component', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-in-yielded-component.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 7,
          column: 4,
        },
        messageId: 'test content',
      },
    ]);
  });

  it('it correctly parses t helper in if/else block', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-in-if-else.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 2,
        },
        messageId: 'if',
      },
      {
        loc: {
          fileName,
          line: 8,
          column: 2,
        },
        messageId: 'else 1',
      },
      {
        loc: {
          fileName,
          line: 10,
          column: 2,
        },
        messageId: 'else 2',
      },
    ]);
  });

  it('it correctly parses t helper in element argument', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-in-element-argument.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 11,
        },
        messageId: 'test content',
      },
    ]);
  });

  it('it correctly parses t helper in element argument string', function () {
    let gettextItems = [];
    let fileName =
      './node-tests/fixtures/parse-hbs/t-in-element-argument-string.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 12,
        },
        messageId: 'test content',
      },
    ]);
  });

  it('it correctly parses t helper in other helper', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-in-helper.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 11,
        },
        messageId: 'test',
      },
      {
        loc: {
          fileName,
          line: 6,
          column: 22,
        },
        messageId: 'other',
      },
    ]);
  });

  it('it correctly parses t helper in nested yielded component', function () {
    let gettextItems = [];
    let fileName =
      './node-tests/fixtures/parse-hbs/t-in-nested-yielded-component.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 8,
          column: 6,
        },
        messageId: 'test content',
      },
    ]);
  });

  it('it correctly parses t helper with tags and indentation', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-with-tags.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 2,
        },
        messageId: `test with
          <strong>tags</strong> and weird indentation
      works`,
      },
    ]);
  });

  it('it correctly parses multiple helpers', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/multiple-helpers.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          fileName,
          line: 6,
          column: 2,
        },
        messageId: 'test content',
      },
      {
        loc: {
          fileName,
          line: 7,
          column: 2,
        },
        messageId: 'other test content',
      },
      {
        loc: {
          fileName,
          line: 8,
          column: 2,
        },
        messageId: 'test content',
      },
      {
        loc: {
          fileName,
          line: 12,
          column: 2,
        },
        messageId: 'test content',
        messageIdPlural: 'test content plural',
      },
    ]);
  });

  it('it ignores helpers in comments', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/ignore-comments.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([]);
  });

  it('it correctly parses angle bracket component invocation', function () {
    let gettextItems = [];
    let fileName =
      './node-tests/fixtures/parse-hbs/angle-bracket-invocation.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          column: 2,
          fileName:
            './node-tests/fixtures/parse-hbs/angle-bracket-invocation.hbs',
          line: 5,
        },
        messageId: 'test inner content',
      },
      {
        loc: {
          column: 12,
          fileName:
            './node-tests/fixtures/parse-hbs/angle-bracket-invocation.hbs',
          line: 2,
        },
        messageId: 'other test content',
      },
      {
        loc: {
          column: 8,
          fileName:
            './node-tests/fixtures/parse-hbs/angle-bracket-invocation.hbs',
          line: 3,
        },
        messageId: 'test content',
      },
    ]);
  });

  it('it correctly parses named blocks', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/named-blocks.hbs';
    parseHbsFile(fileName, gettextItems);

    expect(gettextItems).to.deep.equal([
      {
        loc: {
          column: 4,
          fileName: './node-tests/fixtures/parse-hbs/named-blocks.hbs',
          line: 3,
        },
        messageId: 'first inner',
      },
      {
        loc: {
          column: 4,
          fileName: './node-tests/fixtures/parse-hbs/named-blocks.hbs',
          line: 6,
        },
        messageId: 'second inner',
      },
      {
        loc: {
          column: 23,
          fileName: './node-tests/fixtures/parse-hbs/named-blocks.hbs',
          line: 1,
        },
        messageId: 'other test content',
      },
    ]);
  });

  it('it throws when not using enough arguments for t helper', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-few-arguments.hbs';

    expect(() => parseHbsFile(fileName, gettextItems)).to.throw(
      't-helper does not seem to have proper arguments: ./node-tests/fixtures/parse-hbs/t-few-arguments.hbs:6:2'
    );
  });

  it('it throws when not using enough arguments for n helper', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/n-few-arguments.hbs';

    expect(() => parseHbsFile(fileName, gettextItems)).to.throw(
      'n-helper does not seem to have proper arguments: ./node-tests/fixtures/parse-hbs/n-few-arguments.hbs:6:2'
    );
  });

  it('it throws on variables as arguments for t helper', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-with-variable.hbs';

    expect(() => parseHbsFile(fileName, gettextItems)).to.throw(
      'You need to pass a string as argument to l10n helpers: ./node-tests/fixtures/parse-hbs/t-with-variable.hbs:6:6'
    );
  });

  it('it throws on helpers as arguments for t helper', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/t-with-helper.hbs';

    expect(() => parseHbsFile(fileName, gettextItems)).to.throw(
      'You need to pass a string as argument to l10n helpers: ./node-tests/fixtures/parse-hbs/t-with-helper.hbs:6:6'
    );
  });

  it('it throws on variables as arguments for n helper', function () {
    let gettextItems = [];
    let fileName = './node-tests/fixtures/parse-hbs/n-with-variable.hbs';

    expect(() => parseHbsFile(fileName, gettextItems)).to.throw(
      'You need to pass a string as argument to l10n helpers: ./node-tests/fixtures/parse-hbs/n-with-variable.hbs:6:13'
    );
  });
});
