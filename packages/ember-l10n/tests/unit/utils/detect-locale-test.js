import { detectLocale } from 'ember-l10n/utils/detect-locale';
import { module, test } from 'qunit';

function mockNavigator(locales) {
  return {
    languages: locales,
  };
}

module('Unit | Utility | detect-locale', function () {
  test('it works without navigator', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en'],
      navigator: undefined,
    });

    assert.equal(detectedLocale, 'en');
  });

  test('it works with basic locales', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en', 'ko', 'de'],
      navigator: mockNavigator(['de-AT', 'de-DE', 'en']),
    });

    assert.equal(detectedLocale, 'de');
  });

  test('it works with non-normalized locales', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en', 'ko', 'de'],
      navigator: mockNavigator(['de_AT']),
    });

    assert.equal(detectedLocale, 'de');
  });

  test('it works with no matching locale', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en', 'ko', 'de'],
      navigator: mockNavigator(['fr', 'jp']),
    });

    assert.equal(detectedLocale, 'en');
  });

  test('it works with Chinese locales', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en', 'ko', 'zh_HK', 'jp'],
      navigator: mockNavigator(['de-AT', 'zh_TW']),
    });

    assert.equal(detectedLocale, 'zh_HK');
  });

  test('it works with no detected locale', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en', 'ko', 'de'],
      navigator: mockNavigator([]),
    });

    assert.equal(detectedLocale, 'en');
  });
});
