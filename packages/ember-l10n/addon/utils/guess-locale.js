import { assert } from '@ember/debug';

/**
 * Guess a locale based on allowed & desired locales.
 * This will return the best-fitting locale.
 *
 * Given the following input:
 * allowedLocales = ['en', 'de', 'zh-HK']
 * desiredLocales = ['de-AT', 'de', 'en-US', 'en']
 *
 * It would by default return 'de'.
 *
 * If you specify `allowSubLocales=true`, it would instead return `de-AT`, the favorite sub-locale.
 *
 * In contrast, the following input:
 * allowedLocales = ['en', 'de', 'zh-HK']
 * desiredLocales = ['zh-CN', 'zh-HK', 'en-US', 'en']
 *
 * Would always return 'zh-HK', no matter if sub locales are allowed or not.
 */
export function guessLocale({
  defaultLocale = 'en',
  availableLocales,
  desiredLocales,
}) {
  assert(
    `guessLocale: defaultLocale has to be a string, but is "${defaultLocale}"`,
    typeof defaultLocale === 'string'
  );
  assert(
    `guessLocale: availableLocales has to be an array of strings, but is "${availableLocales}"`,
    Array.isArray(availableLocales) &&
      !availableLocales.some((locale) => typeof locale !== 'string')
  );
  assert(
    `guessLocale: desiredLocales has to be an array of strings, but is "${desiredLocales}"`,
    Array.isArray(desiredLocales) &&
      !desiredLocales.some((locale) => typeof locale !== 'string')
  );

  let normalizedDesiredLocales = desiredLocales
    .map(normalizeLocale)
    .map(getLocalAlias);

  return (
    normalizedDesiredLocales
      .map((locale) => {
        return availableLocales.find(
          (availableLocale) => locale.indexOf(availableLocale) === 0
        );
      })
      .filter(Boolean)[0] || defaultLocale
  );
}

function normalizeLocale(locale) {
  let canonicalLocales = Intl.getCanonicalLocales(locale);

  return canonicalLocales[0];
}

function getLocalAlias(locale) {
  // There are variations of chinese locales
  // We need to map those to either Simplified (CN) or Traditional (HK).
  // Sadly, we cannot simply fall back to zh here, as that is not actually a valid locale
  switch (locale) {
    case 'zh-CN':
    case 'zh-SG':
    case 'zh-Hans':
    case 'zh':
      return 'zh-CN';
    case 'zh-HK':
    case 'zh-TW':
    case 'zh-MO':
    case 'zh-Hant':
      return 'zh-HK';
  }

  return locale;
}
