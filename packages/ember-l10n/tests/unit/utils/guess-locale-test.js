import { guessLocale } from '@ember-gettext/ember-l10n/utils/guess-locale';
import { module, test } from 'qunit';

module('Unit | Utility | guess-locale', function () {
  test('it works with en only', function (assert) {
    let guessedLocale = guessLocale({
      defaultLocale: 'en',
      availableLocales: ['en'],
      desiredLocales: ['en'],
    });

    assert.equal(guessedLocale, 'en');
  });

  test('it detects sub-locales of base locale', function (assert) {
    let guessedLocale = guessLocale({
      defaultLocale: 'en',
      availableLocales: ['en'],
      desiredLocales: ['en-US'],
    });

    assert.equal(guessedLocale, 'en');
  });

  test('it detects sub-locales of other locale', function (assert) {
    let guessedLocale = guessLocale({
      defaultLocale: 'en',
      availableLocales: ['de'],
      desiredLocales: ['de-AT'],
    });

    assert.equal(guessedLocale, 'de');
  });

  test('it detects sub-locales if allowed', function (assert) {
    let guessedLocale = guessLocale({
      defaultLocale: 'en',
      availableLocales: ['de-AT'],
      desiredLocales: ['de-DE', 'de-AT'],
    });

    assert.equal(guessedLocale, 'de-AT');
  });

  test('it works with multiple locales', function (assert) {
    let guessedLocale = guessLocale({
      defaultLocale: 'en',
      availableLocales: ['ko', 'en', 'de'],
      desiredLocales: ['fr', 'de-AT'],
    });

    assert.equal(guessedLocale, 'de');
  });

  test('it works with no desired locale', function (assert) {
    let guessedLocale = guessLocale({
      defaultLocale: 'de',
      availableLocales: ['ko', 'en', 'de'],
      desiredLocales: [],
    });

    assert.equal(guessedLocale, 'de');
  });

  test('it normalizes desired locales', function (assert) {
    let guessedLocale = guessLocale({
      defaultLocale: 'en',
      availableLocales: ['ko', 'en', 'de-AT'],
      desiredLocales: ['fr', 'de-AT'],
    });

    assert.equal(guessedLocale, 'de-AT');
  });

  module('simplified Chinese locales', function () {
    ['zh-CN', 'zh-CN', 'zh', 'zh-Hans', 'zh-SG'].forEach((locale) => {
      test(`it normalizes "${locale}" to zh-CN`, function (assert) {
        let guessedLocale = guessLocale({
          defaultLocale: 'en',
          availableLocales: ['ko', 'en', 'zh-CN'],
          desiredLocales: ['fr', locale],
        });

        assert.equal(guessedLocale, 'zh-CN');
      });
    });
  });

  module('traditional Chinese locales', function () {
    ['zh-HK', 'zh-HK', 'zh-TW', 'zh-Hant', 'zh-MO'].forEach((locale) => {
      test(`it normalizes "${locale}" to zh-HK`, function (assert) {
        let guessedLocale = guessLocale({
          defaultLocale: 'en',
          availableLocales: ['ko', 'en', 'zh-HK'],
          desiredLocales: ['fr', locale],
        });

        assert.equal(guessedLocale, 'zh-HK');
      });
    });
  });
});
