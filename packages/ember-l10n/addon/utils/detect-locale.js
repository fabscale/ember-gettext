import { assert } from '@ember/debug';
import { guessLocale } from 'ember-l10n/utils/guess-locale';

export function detectLocale({
  defaultLocale = 'en',
  availableLocales,
  navigator = window.navigator,
}) {
  assert(
    `detectLocale: defaultLocale has to be a string, but is "${defaultLocale}"`,
    typeof defaultLocale === 'string'
  );
  assert(
    `detectLocale: availableLocales has to be an array of strings, but is "${availableLocales}"`,
    Array.isArray(availableLocales) &&
      !availableLocales.some((locale) => typeof locale !== 'string')
  );

  let locale = guessBrowserLocale({
    defaultLocale,
    availableLocales,
    navigator,
  });

  if (!availableLocales.includes(locale)) {
    return defaultLocale;
  }

  return locale;
}

function guessBrowserLocale({ defaultLocale, availableLocales, navigator }) {
  let desiredLocales = getBrowserLocales({ defaultLocale, navigator });

  return guessLocale({ availableLocales, desiredLocales, defaultLocale });
}

function getBrowserLocales({ defaultLocale, navigator }) {
  if (!navigator) {
    return [defaultLocale];
  }

  let desiredLocales = (navigator.languages || [navigator.language]).filter(
    Boolean
  );

  if (desiredLocales.length === 0) {
    return [defaultLocale];
  }

  return desiredLocales;
}
