import { mockLocale } from 'dummy/tests/helpers/mock-locale';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | l10n', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:l10n');
    assert.ok(service);
  });

  test('it works without a locale loaded', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    assert.strictEqual(l10n.locale, 'en', 'locale is correct');

    assert.strictEqual(l10n.t('test thingy'), 'test thingy');
    assert.strictEqual(
      l10n.t('My name is {{name}}.', { name: 'john doe' }),
      'My name is john doe.'
    );
    assert.strictEqual(
      l10n.n(
        'My name is {{name}} {{count}}.',
        'my names are {{name}} {{count}}.',
        1,
        { name: 'john doe' }
      ),
      'My name is john doe 1.'
    );
  });

  module('locale loading', function () {
    test('it works', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');

      await l10n.setLocale('en');

      assert.strictEqual(l10n.locale, 'en', 'locale is correct');

      assert.strictEqual(l10n.t('test thingy'), 'test thingy');
      assert.strictEqual(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        'My name is john doe.'
      );
      assert.strictEqual(
        l10n.n(
          'My name is {{name}} {{count}}.',
          'my names are {{name}} {{count}}.',
          1,
          { name: 'john doe' }
        ),
        'My name is john doe 1.'
      );

      await l10n.setLocale('de');

      assert.strictEqual(l10n.locale, 'de', 'locale is correct');

      assert.strictEqual(l10n.t('test thingy'), 'test thingy');
      assert.strictEqual(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        'Mein Name ist john doe.'
      );
      assert.strictEqual(
        l10n.n(
          'My name is {{name}} {{count}}.',
          'my names are {{name}} {{count}}.',
          1,
          { name: 'john doe' }
        ),
        'My name is john doe 1.'
      );

      // Change back
      await l10n.setLocale('en');

      assert.strictEqual(l10n.locale, 'en', 'locale is correct');

      assert.strictEqual(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        'My name is john doe.'
      );
    });

    test('it works before locale is loaded', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');

      let promise = l10n.setLocale('ko');

      assert.strictEqual(l10n.locale, 'en', 'locale is not yet updated');

      assert.strictEqual(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        'My name is john doe.'
      );

      await promise;

      assert.strictEqual(l10n.locale, 'ko', 'locale is updated');

      assert.strictEqual(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        '내 이름은 john doe.'
      );
    });

    test('it asserts for an empty locale map', async function (assert) {
      this.owner.register(
        'ember-l10n:locales',
        {},
        {
          instantiate: false,
        }
      );

      assert.throws(
        () => this.owner.lookup('service:l10n'),
        /There are no locales defined in the locale map./
      );
    });

    test('it handles a missing locale file', async function (assert) {
      this.owner.register(
        'ember-l10n:locales',
        {
          it: () => null,
        },
        {
          instantiate: false,
        }
      );

      let l10n = this.owner.lookup('service:l10n');

      try {
        await l10n.setLocale('de');
      } catch (error) {
        assert.step('error is thrown');
        assert.strictEqual(
          error.message,
          'Assertion Failed: ember-l10n: Cannot find locale file for locale "de"',
          'error is correct'
        );
      }

      assert.strictEqual(l10n.locale, 'en', 'locale is not updated');

      assert.verifySteps(['error is thrown']);
    });

    test('it handles non-loadable locale file', async function (assert) {
      this.owner.register(
        'ember-l10n:locales',
        {
          de: () => {
            throw new Error(`TEST error cannot load locale de`);
          },
        },
        {
          instantiate: false,
        }
      );

      let l10n = this.owner.lookup('service:l10n');

      try {
        await l10n.setLocale('de');
      } catch (error) {
        assert.step('error is thrown');
        assert.strictEqual(
          error.message,
          'TEST error cannot load locale de',
          'error is correct'
        );
      }

      assert.strictEqual(l10n.locale, 'en', 'locale is not updated');

      assert.verifySteps(['error is thrown']);
    });

    test('it works with a sub-locale of an existing locale', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');

      await l10n.setLocale('en-gb');

      assert.strictEqual(l10n.locale, 'en', 'locale is correct');

      assert.strictEqual(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        'My name is john doe.'
      );

      await l10n.setLocale('de-AT');

      assert.strictEqual(l10n.locale, 'de', 'locale is correct');

      assert.strictEqual(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        'Mein Name ist john doe.'
      );
    });
  });

  test('t() works', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    mockLocale(l10n, {
      'test thingy': 'test 1',
      'My name is {{name}}.': 'Mein Name ist {{name}}.',
    });
    mockLocale(l10n, { 'test thingy': 'test 2' }, 'test context');

    assert.strictEqual(l10n.t('test thingy'), 'test 1');
    assert.strictEqual(l10n.t('test thingy', {}, 'test context'), 'test 2');
    assert.strictEqual(
      l10n.t('My name is {{name}}.', { name: 'john doe' }),
      'Mein Name ist john doe.'
    );
  });

  test('tVar() works', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    mockLocale(l10n, {
      'test thingy': 'test 1',
      'My name is {{name}}.': 'Mein Name ist {{name}}.',
    });
    mockLocale(l10n, { 'test thingy': 'test 2' }, 'test context');

    assert.strictEqual(l10n.tVar('test thingy'), 'test 1');
    assert.strictEqual(l10n.tVar('test thingy', {}, 'test context'), 'test 2');
    assert.strictEqual(
      l10n.tVar('My name is {{name}}.', { name: 'john doe' }),
      'Mein Name ist john doe.'
    );
  });

  test('n() works', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    mockLocale(l10n, {
      'My name is {{name}} {{count}}.': [
        'Mein Name ist {{name}} {{count}}.',
        'Meine Namen sind {{name}} {{count}}.',
      ],
    });
    mockLocale(
      l10n,
      {
        'My name is {{name}} {{count}}.': [
          'XX {{name}} {{count}}.',
          'YY {{name}} {{count}}.',
        ],
      },
      'test context'
    );

    assert.strictEqual(
      l10n.n(
        'My name is {{name}} {{count}}.',
        'my names are {{name}} {{count}}.',
        1,
        { name: 'john doe' }
      ),
      'Mein Name ist john doe 1.'
    );

    assert.strictEqual(
      l10n.n(
        'My name is {{name}} {{count}}.',
        'my names are {{name}} {{count}}.',
        1,
        { name: 'john doe' },
        'test context'
      ),
      'XX john doe 1.'
    );
  });

  test('nVar() works', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    mockLocale(l10n, {
      'My name is {{name}} {{count}}.': [
        'Mein Name ist {{name}} {{count}}.',
        'Meine Namen sind {{name}} {{count}}.',
      ],
    });
    mockLocale(
      l10n,
      {
        'My name is {{name}} {{count}}.': [
          'XX {{name}} {{count}}.',
          'YY {{name}} {{count}}.',
        ],
      },
      'test context'
    );

    assert.strictEqual(
      l10n.nVar(
        'My name is {{name}} {{count}}.',
        'my names are {{name}} {{count}}.',
        1,
        { name: 'john doe' }
      ),
      'Mein Name ist john doe 1.'
    );

    assert.strictEqual(
      l10n.nVar(
        'My name is {{name}} {{count}}.',
        'my names are {{name}} {{count}}.',
        1,
        { name: 'john doe' },
        'test context'
      ),
      'XX john doe 1.'
    );
  });

  module('plurals', function () {
    test('it works with existing translation (de)', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');
      mockLocale(
        l10n,
        {
          'I have {{count}} point.': [
            'Ich habe {{count}} Punkt.',
            'Ich habe {{count}} Punkte.',
          ],
        },
        '',
        { locale: 'de' }
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 0),
        'Ich habe 0 Punkte.'
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 1),
        'Ich habe 1 Punkt.'
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 2),
        'Ich habe 2 Punkte.'
      );
    });

    test('it works with missing translation (de)', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');

      mockLocale(
        l10n,
        {
          'I have {{count}} point.': [],
        },
        '',
        { locale: 'de' }
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 0),
        'I have 0 points.'
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 1),
        'I have 1 point.'
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 2),
        'I have 2 points.'
      );
    });

    // ko locale only has one singlular/plural form
    test('it works with existing translation (ko)', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');
      mockLocale(
        l10n,
        {
          'I have {{count}} point.': ['XXX YYY {{count}}.'],
        },
        '',
        { locale: 'ko' }
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 0),
        'XXX YYY 0.'
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 1),
        'XXX YYY 1.'
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 2),
        'XXX YYY 2.'
      );
    });

    test('it works with missing translation (ko)', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');

      mockLocale(
        l10n,
        {
          'I have {{count}} point.': [],
        },
        '',
        { locale: 'ko' }
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 0),
        'I have 0 points.'
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 1),
        'I have 1 point.'
      );

      assert.strictEqual(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 2),
        'I have 2 points.'
      );
    });

    // ar has all possible forms: zero, one, two, few, many, other
    test('it works with existing translation (ar)', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');
      mockLocale(
        l10n,
        {
          '{{count}} item': ['zero', 'one', 'two', 'few', 'many', 'other'],
        },
        '',
        { locale: 'ar-eg' }
      );

      assert.strictEqual(
        l10n.n('{{count}} item', '{{count}} items', 0),
        'zero'
      );
      assert.strictEqual(l10n.n('{{count}} item', '{{count}} items', 1), 'one');
      assert.strictEqual(l10n.n('{{count}} item', '{{count}} items', 2), 'two');
      assert.strictEqual(l10n.n('{{count}} item', '{{count}} items', 4), 'few');
      assert.strictEqual(l10n.n('{{count}} item', '{{count}} items', 8), 'few');
      assert.strictEqual(
        l10n.n('{{count}} item', '{{count}} items', 15),
        'many'
      );
      assert.strictEqual(
        l10n.n('{{count}} item', '{{count}} items', 100),
        'other'
      );
    });

    test('it asserts if trying to use missing plural form (de)', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');
      mockLocale(
        l10n,
        {
          'I have {{count}} point.': ['Ich habe {{count}} Punkt.'],
        },
        '',
        { locale: 'de' }
      );

      assert.throws(
        () => l10n.n('I have {{count}} point.', 'I have {{count}} points.', 0),
        /Assertion Failed: Message with index 1 is not found for count=0/,
        'it throws an error'
      );
    });

    test('it asserts if trying to use missing plural form (ar)', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');
      mockLocale(
        l10n,
        {
          '{{count}} item': ['zero', 'one', 'two', 'few', 'many'],
        },
        '',
        { locale: 'ar-eg' }
      );

      assert.throws(
        () => l10n.n('{{count}} item', '{{count}} items', 100),
        /Assertion Failed: Message with index 5 is not found for count=100/,
        'it throws an error'
      );
    });
  });
});
