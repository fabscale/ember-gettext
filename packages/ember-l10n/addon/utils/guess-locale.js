import { assert } from '@ember/debug';

/**
 * Guess a locale based on allowed & desired locales.
 * This will return the best-fitting locale.
 *
 * Given the following input:
 * allowedLocales = ['en', 'de', 'zh_HK']
 * desiredLocales = ['de-AT', 'de', 'en-US', 'en']
 *
 * It would by default return 'de'.
 *
 * If you specify `allowSubLocales=true`, it would instead return `de_AT`, the favorite sub-locale.
 *
 * In contrast, the following input:
 * allowedLocales = ['en', 'de', 'zh_HK']
 * desiredLocales = ['zh-CN', 'zh-HK', 'en-US', 'en']
 *
 * Would always return 'zh_HK', no matter if sub locales are allowed or not.
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
  locale = locale.replace('-', '_');
  let [mainLocale, region] = locale.split('_');
  if (region) {
    return `${mainLocale}_${region.toUpperCase()}`;
  }

  return mainLocale;
}

function getLocalAlias(locale) {
  // There are variations of chinese locales
  // We need to map those to either Simplified (CN) or Traditional (HK).
  // Sadly, we cannot simply fall back to zh here, as that is not actually a valid locale
  switch (locale) {
    case 'zh_CN':
    case 'zh_SG':
    case 'zh_HANS':
    case 'zh':
      return 'zh_CN';
    case 'zh_HK':
    case 'zh_TW':
    case 'zh_MO':
    case 'zh_HANT':
      return 'zh_HK';
  }

  return locale;
}
