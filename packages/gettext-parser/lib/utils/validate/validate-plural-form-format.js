const PLURAL_FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];

const ALIAS_LOCALES = {
  fr: 'pt',
};

function validatePluralFormFormat(pluralForm, locale) {
  if (ALIAS_LOCALES[locale]) {
    locale = ALIAS_LOCALES[locale];
  }

  let pluralRules = new Intl.PluralRules(locale);
  let { pluralCategories, locale: parsedLocale } =
    pluralRules.resolvedOptions();

  // We want to ensure a stable sorting
  // As this could be in any order, but gettext will try to keep a stable ordering from few->many
  let sortedPluralCategories = PLURAL_FORMS.filter((pluralForm) =>
    pluralCategories.includes(pluralForm)
  );

  if (!parsedLocale.includes(locale)) {
    throw new Error(
      `given locale could not be identified correctly for pluralization purposes - is: "${locale}" but is parsed as "${parsedLocale}"`
    );
  }

  let parsedPluralFactory = setupPluralFactory(pluralForm);

  let usedCategories = [];

  // PO only accounts for positive numbers, so we do not check negative ones
  for (let i = 0; i <= 10000; i++) {
    checkNumber(
      i,
      usedCategories,
      pluralRules,
      pluralForm,
      parsedPluralFactory,
      sortedPluralCategories
    );
  }

  // Check some manual higher numbers as well
  checkNumber(
    100000,
    usedCategories,
    pluralRules,
    pluralForm,
    parsedPluralFactory,
    sortedPluralCategories
  );

  checkNumber(
    1000000,
    usedCategories,
    pluralRules,
    pluralForm,
    parsedPluralFactory,
    sortedPluralCategories
  );

  checkNumber(
    10000000,
    usedCategories,
    pluralRules,
    pluralForm,
    parsedPluralFactory,
    sortedPluralCategories
  );
}

function checkNumber(
  i,
  usedCategories,
  pluralRules,
  pluralForm,
  parsedPluralFactory,
  sortedPluralCategories
) {
  let pos = parsedPluralFactory(i);

  let parsedCategory = sortedPluralCategories[pos];
  let category = pluralRules.select(i);

  if (typeof parsedCategory === 'undefined') {
    throw new Error(
      `plural-form header does not match Intl.PluralRules(). It is "${pluralForm}", which does not map to ${JSON.stringify(
        sortedPluralCategories
      )}`
    );
  }

  if (category !== parsedCategory) {
    throw new Error(
      `plural-form header does not match Intl.PluralRules(). Parsed plural for ${i} is ${parsedCategory}, but should be ${category}`
    );
  }

  if (!usedCategories.includes(parsedCategory)) {
    usedCategories.push(parsedCategory);
  }
}

// This code was previously used to parse plural forms by ember-l10n
// Takes something like: nplurals=2; plural=(n != 1); or nplurals=1; plural=0;
function setupPluralFactory(pluralForm) {
  let regex =
    /^\s*nplurals=\s*(\d+)\s*;\s*plural\s*=\s*([-+*/%?!&|=<>():;n\d\s]+);$/;

  if (!pluralForm || !pluralForm.match(regex)) {
    throw new Error('No plural-form header is present');
  }

  let maxMessageIndex, pluralExpression;
  let m;
  if ((m = regex.exec(pluralForm)) !== null) {
    maxMessageIndex = m[1] * 1 - 1;
    pluralExpression = m[2];
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  return (n) => {
    let pluralPos = eval(pluralExpression);

    if (typeof pluralPos !== 'number') {
      pluralPos = pluralPos ? 1 : 0;
    }

    if (pluralPos > maxMessageIndex) {
      return 0;
    }

    return pluralPos;
  };
}

module.exports = {
  validatePluralFormFormat,
};
