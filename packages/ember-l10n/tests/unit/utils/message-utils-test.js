import {
  replacePlaceholders,
  sanitizeMessageId,
  sanitizeJSON,
  setupPluralFactory,
} from '@ember-gettext/ember-l10n/utils/message-utils';
import { module, test } from 'qunit';

module('Unit | Utility | message-utils', function () {
  module('replacePlaceholders', function () {
    test('it works without placeholders', function (assert) {
      let result = replacePlaceholders('my message', {});

      assert.equal(result, 'my message');
    });

    test('it works with placeholders', function (assert) {
      let result = replacePlaceholders('my message: {{message}}', {
        message: 'hello there!',
      });

      assert.equal(result, 'my message: hello there!');
    });

    test('it works with empty string placeholders', function (assert) {
      let result = replacePlaceholders('my message: {{message}}', {
        message: '',
      });

      assert.equal(result, 'my message: ');
    });

    test('it works with multiple placeholders', function (assert) {
      let result = replacePlaceholders(
        'my message: {{message}}, {{other}} and {{message}}',
        {
          message: 'test1',
          other: 'test2',
        }
      );

      assert.equal(result, 'my message: test1, test2 and test1');
    });

    test('it works with whitespace in placeholders', function (assert) {
      let result = replacePlaceholders('my message: {{ message  }}', {
        message: 'test1',
      });

      assert.equal(result, 'my message: test1');
    });
  });

  module('sanitizeMessageId', function () {
    test('it works with a simple id', function (assert) {
      let result = sanitizeMessageId('hello there!');

      assert.equal(result, 'hello there!');
    });

    test('it normalizes whitespace', function (assert) {
      let result = sanitizeMessageId(`  hello  there!  what is it?
      that's kind of a lot...  `);

      assert.equal(
        result,
        ` hello there! what is it? that's kind of a lot... `
      );
    });
  });

  module('sanitizeJSON', function () {
    test('it works with a basic JSON payload', function (assert) {
      let json = {
        charset: 'utf-8',
        headers: {
          'project-id-version': 'My project',
          'plural-forms': 'nplurals=2; plural=(n != 1);',
        },
        translations: {
          '': {
            'Hello world!': {
              msgid: 'Hello world!',
              comments: {
                reference: 'path/to/source/file:XXX',
              },
              msgstr: ['Hallo Welt!'],
            },
            '  WHAT  is it  ': {
              msgid: '  WHAT is it  ',
              comments: {
                reference: 'path/to/source/file:XXX',
              },
              msgstr: ['Was ist es?'],
            },
          },
          menu: {
            'User  ': {
              msgid: 'User  ',
              msgctxt: 'menu',
              comments: {
                reference: 'path/to/source/file:XXX',
              },
              msgstr: ['Account'],
            },
          },
        },
      };
      let result = sanitizeJSON(json);

      assert.deepEqual(result, {
        charset: 'utf-8',
        headers: {
          'project-id-version': 'My project',
          'plural-forms': 'nplurals=2; plural=(n != 1);',
        },
        translations: {
          '': {
            'Hello world!': {
              msgid: 'Hello world!',
              comments: {
                reference: 'path/to/source/file:XXX',
              },
              msgstr: ['Hallo Welt!'],
            },
            ' WHAT is it ': {
              msgid: ' WHAT is it ',
              comments: {
                reference: 'path/to/source/file:XXX',
              },
              msgstr: ['Was ist es?'],
            },
          },
          menu: {
            'User ': {
              msgid: 'User ',
              msgctxt: 'menu',
              comments: {
                reference: 'path/to/source/file:XXX',
              },
              msgstr: ['Account'],
            },
          },
        },
      });
    });
  });

  module('setupPluralFactory', function () {
    test('it works with a standard plural form: nplurals=2; plural=(n != 1);', function (assert) {
      let pluralForm = 'nplurals=2; plural=(n != 1);';
      let result = setupPluralFactory(pluralForm, pluralForm);

      assert.equal(typeof result, 'function', 'result is a function');
      assert.equal(result(0), 1, 'it works for 0');
      assert.equal(result(1), 0, 'it works for 1');
      assert.equal(result(2), 1, 'it works for 2');
      assert.equal(result(3), 1, 'it works for 3');
      assert.equal(result(3000), 1, 'it works for 3000');
      assert.equal(result(-1), 1, 'it works for -1');
    });

    test('it works with nplurals=1; plural=0;', function (assert) {
      let pluralForm = 'nplurals=1; plural=0;';
      let result = setupPluralFactory(pluralForm, pluralForm);

      assert.equal(typeof result, 'function', 'result is a function');
      assert.equal(result(0), 0, 'it works for 0');
      assert.equal(result(1), 0, 'it works for 1');
      assert.equal(result(2), 0, 'it works for 2');
      assert.equal(result(3), 0, 'it works for 3');
      assert.equal(result(3000), 0, 'it works for 3000');
      assert.equal(result(-1), 0, 'it works for -1');
    });
  });
});
