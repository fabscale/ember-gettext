import { detectLocale } from '@ember-gettext/ember-l10n/utils/detect-locale';
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

    assert.strictEqual(detectedLocale, 'en');
  });

  test('it works with basic locales', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en', 'ko', 'de'],
      navigator: mockNavigator(['de-AT', 'de-DE', 'en']),
    });

    assert.strictEqual(detectedLocale, 'de');
  });

  test('it works with non-normalized locales', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en', 'ko', 'de'],
      navigator: mockNavigator(['de-AT']),
    });

    assert.strictEqual(detectedLocale, 'de');
  });

  test('it works with no matching locale', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en', 'ko', 'de'],
      navigator: mockNavigator(['fr', 'jp']),
    });

    assert.strictEqual(detectedLocale, 'en');
  });

  test('it works with Chinese locales', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en', 'ko', 'zh-HK', 'jp'],
      navigator: mockNavigator(['de-AT', 'zh-TW']),
    });

    assert.strictEqual(detectedLocale, 'zh-HK');
  });

  test('it works with no detected locale', function (assert) {
    let detectedLocale = detectLocale({
      defaultLocale: 'en',
      availableLocales: ['en', 'ko', 'de'],
      navigator: mockNavigator([]),
    });

    assert.strictEqual(detectedLocale, 'en');
  });
});
