import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import L10nService, {
  clearLocaleCache,
} from '@ember-gettext/ember-l10n/services/l10n';
import { mockLocale } from 'dummy/tests/helpers/mock-locale';

module('Unit | Service | l10n', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:l10n');
    assert.ok(service);
  });

  test('it works without a locale loaded', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    assert.equal(l10n.locale, 'en', 'locale is correct');

    assert.equal(l10n.t('test thingy'), 'test thingy');
    assert.equal(
      l10n.t('My name is {{name}}.', { name: 'john doe' }),
      'My name is john doe.'
    );
    assert.equal(
      l10n.n(
        'My name is {{name}} {{count}}.',
        'my names are {{name}} {{count}}.',
        1,
        { name: 'john doe' }
      ),
      'My name is john doe 1.'
    );
  });

  module('locale loading', function (hooks) {
    hooks.beforeEach(function () {
      clearLocaleCache();
    });

    test('it works', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');

      await l10n.setLocale('en');

      assert.equal(l10n.locale, 'en', 'locale is correct');

      assert.equal(l10n.t('test thingy'), 'test thingy');
      assert.equal(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        'My name is john doe.'
      );
      assert.equal(
        l10n.n(
          'My name is {{name}} {{count}}.',
          'my names are {{name}} {{count}}.',
          1,
          { name: 'john doe' }
        ),
        'My name is john doe 1.'
      );

      await l10n.setLocale('de');

      assert.equal(l10n.locale, 'de', 'locale is correct');

      assert.equal(l10n.t('test thingy'), 'test thingy');
      assert.equal(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        'Mein Name ist john doe.'
      );
      assert.equal(
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

      assert.equal(l10n.locale, 'en', 'locale is correct');

      assert.equal(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        'My name is john doe.'
      );
    });

    test('it works before locale is loaded', async function (assert) {
      let l10n = this.owner.lookup('service:l10n');

      let promise = l10n.setLocale('ko');

      assert.equal(l10n.locale, 'en', 'locale is not yet updated');

      assert.equal(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        'My name is john doe.'
      );

      await promise;

      assert.equal(l10n.locale, 'ko', 'locale is updated');

      assert.equal(
        l10n.t('My name is {{name}}.', { name: 'john doe' }),
        '내 이름은 john doe.'
      );
    });

    test('it handles a missing locale file', async function (assert) {
      class ExtendedL10nService extends L10nService {
        _staticAssetMap = {};
      }

      this.owner.register('service:l10n', ExtendedL10nService);
      let l10n = this.owner.lookup('service:l10n');

      try {
        await l10n.setLocale('de');
      } catch (error) {
        assert.step('error is thrown');
        assert.equal(
          error.message,
          'Assertion Failed: ember-l10n: Cannot find locale file path for locale "de"',
          'error is correct'
        );
      }

      assert.equal(l10n.locale, 'en', 'locale is not updated');

      assert.verifySteps(['error is thrown']);
    });

    test('it handles non-loadable locale file', async function (assert) {
      class ExtendedL10nService extends L10nService {
        _fetch(path) {
          throw new Error(`TEST error cannot load ${path}`);
        }
      }

      this.owner.register('service:l10n', ExtendedL10nService);
      let l10n = this.owner.lookup('service:l10n');

      try {
        await l10n.setLocale('de');
      } catch (error) {
        assert.step('error is thrown');
        assert.equal(
          error.message,
          'TEST error cannot load /assets/locales/de.json',
          'error is correct'
        );
      }

      assert.equal(l10n.locale, 'en', 'locale is not updated');

      assert.verifySteps(['error is thrown']);
    });
  });

  test('t() works', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    mockLocale(l10n, {
      'test thingy': 'test 1',
      'My name is {{name}}.': 'Mein Name ist {{name}}.',
    });
    mockLocale(l10n, { 'test thingy': 'test 2' }, 'test context');

    assert.equal(l10n.t('test thingy'), 'test 1');
    assert.equal(l10n.t('test thingy', {}, 'test context'), 'test 2');
    assert.equal(
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

    assert.equal(l10n.tVar('test thingy'), 'test 1');
    assert.equal(l10n.tVar('test thingy', {}, 'test context'), 'test 2');
    assert.equal(
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

    assert.equal(
      l10n.n(
        'My name is {{name}} {{count}}.',
        'my names are {{name}} {{count}}.',
        1,
        { name: 'john doe' }
      ),
      'Mein Name ist john doe 1.'
    );

    assert.equal(
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

    assert.equal(
      l10n.nVar(
        'My name is {{name}} {{count}}.',
        'my names are {{name}} {{count}}.',
        1,
        { name: 'john doe' }
      ),
      'Mein Name ist john doe 1.'
    );

    assert.equal(
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

      assert.equal(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 0),
        'Ich habe 0 Punkte.'
      );

      assert.equal(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 1),
        'Ich habe 1 Punkt.'
      );

      assert.equal(
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

      assert.equal(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 0),
        'I have 0 points.'
      );

      assert.equal(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 1),
        'I have 1 point.'
      );

      assert.equal(
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

      assert.equal(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 0),
        'XXX YYY 0.'
      );

      assert.equal(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 1),
        'XXX YYY 1.'
      );

      assert.equal(
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

      assert.equal(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 0),
        'I have 0 points.'
      );

      assert.equal(
        l10n.n('I have {{count}} point.', 'I have {{count}} points.', 1),
        'I have 1 point.'
      );

      assert.equal(
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

      assert.equal(l10n.n('{{count}} item', '{{count}} items', 0), 'zero');
      assert.equal(l10n.n('{{count}} item', '{{count}} items', 1), 'one');
      assert.equal(l10n.n('{{count}} item', '{{count}} items', 2), 'two');
      assert.equal(l10n.n('{{count}} item', '{{count}} items', 4), 'few');
      assert.equal(l10n.n('{{count}} item', '{{count}} items', 8), 'few');
      assert.equal(l10n.n('{{count}} item', '{{count}} items', 15), 'many');
      assert.equal(l10n.n('{{count}} item', '{{count}} items', 100), 'other');
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
