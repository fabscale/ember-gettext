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
      desiredLocales: ['en_US'],
    });

    assert.equal(guessedLocale, 'en');
  });

  test('it detects sub-locales of other locale', function (assert) {
    let guessedLocale = guessLocale({
      defaultLocale: 'en',
      availableLocales: ['de'],
      desiredLocales: ['de_AT'],
    });

    assert.equal(guessedLocale, 'de');
  });

  test('it detects sub-locales if allowed', function (assert) {
    let guessedLocale = guessLocale({
      defaultLocale: 'en',
      availableLocales: ['de_AT'],
      desiredLocales: ['de_DE', 'de_AT'],
    });

    assert.equal(guessedLocale, 'de_AT');
  });

  test('it works with multiple locales', function (assert) {
    let guessedLocale = guessLocale({
      defaultLocale: 'en',
      availableLocales: ['ko', 'en', 'de'],
      desiredLocales: ['fr', 'de_AT'],
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
      availableLocales: ['ko', 'en', 'de_AT'],
      desiredLocales: ['fr', 'de-AT'],
    });

    assert.equal(guessedLocale, 'de_AT');
  });

  module('simplified Chinese locales', function () {
    ['zh-CN', 'zh_CN', 'zh', 'zh_Hans', 'zh-SG'].forEach((locale) => {
      test(`it normalizes "${locale}" to zh_CN`, function (assert) {
        let guessedLocale = guessLocale({
          defaultLocale: 'en',
          availableLocales: ['ko', 'en', 'zh_CN'],
          desiredLocales: ['fr', locale],
        });

        assert.equal(guessedLocale, 'zh_CN');
      });
    });
  });

  module('traditional Chinese locales', function () {
    ['zh-HK', 'zh_HK', 'zh_TW', 'zh_Hant', 'zh_MO'].forEach((locale) => {
      test(`it normalizes "${locale}" to zh_HK`, function (assert) {
        let guessedLocale = guessLocale({
          defaultLocale: 'en',
          availableLocales: ['ko', 'en', 'zh_HK'],
          desiredLocales: ['fr', locale],
        });

        assert.equal(guessedLocale, 'zh_HK');
      });
    });
  });
});
