const parsePluralFormsCount = require('./../parse-plural-forms');

const PLURAL_FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];

function validatePluralFormFormat(pluralForm, locale) {
  let pluralRules = new Intl.PluralRules(locale);
  let { locale: parsedLocale } = pluralRules.resolvedOptions();

  if (!parsedLocale.includes(locale)) {
    throw new Error(
      `given locale could not be identified correctly for pluralization purposes - is: "${locale}" but is parsed as "${parsedLocale}"`
    );
  }

  let parsedPluralForm = parsePluralForm(pluralForm);

  let pluralFactory = new PluralFactory(locale, parsedPluralForm.count);

  // PO only accounts for positive numbers, so we do not check negative ones
  for (let i = 0; i <= 10000; i++) {
    checkNumber(i, parsedPluralForm, pluralFactory);
  }

  // Check some manual higher numbers as well
  checkNumber(100000, parsedPluralForm, pluralFactory);

  checkNumber(1000000, parsedPluralForm, pluralFactory);

  checkNumber(10000000, parsedPluralForm, pluralFactory);
}

function checkNumber(i, parsedPluralForm, pluralFactory) {
  let pluralFormPos = parsedPluralForm.fn(i);
  let pluralFactoryPos = pluralFactory.getMessageIndex(i);

  if (pluralFormPos !== pluralFactoryPos) {
    throw new Error(
      `plural-form header does not match Intl.PluralRules() for number ${i}. Expected pos ${pluralFormPos} but was ${pluralFactoryPos}.`
    );
  }
}

// This code was previously used to parse plural forms by ember-l10n
// Takes something like: nplurals=2; plural=(n != 1); or nplurals=1; plural=0;
function parsePluralForm(pluralForm) {
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
  let fn = (n) => {
    let pluralPos = eval(pluralExpression);

    if (typeof pluralPos !== 'number') {
      pluralPos = pluralPos ? 1 : 0;
    }

    if (pluralPos > maxMessageIndex) {
      return 0;
    }

    return pluralPos;
  };

  let count = parsePluralFormsCount(pluralForm);

  return { fn, count };
}

// NOTE: Keep in sync with packages/ember-l10n/addon/utils/plural-factory.js
class PluralFactory {
  locale;
  pluralRules;

  map = new Map();

  constructor(locale, pluralFormsCount) {
    this.locale = locale;

    this.pluralRules = new Intl.PluralRules(locale);

    // We want to ensure a stable sorting
    // As this could be in any order, but gettext will try to keep a stable ordering from few->many
    let pluralForms = this.pluralRules.resolvedOptions().pluralCategories;

    let sortedPluralForms = PLURAL_FORMS.filter((pluralForm) =>
      pluralForms.includes(pluralForm)
    );

    let maxMessageId = pluralFormsCount
      ? pluralFormsCount - 1
      : sortedPluralForms.length - 1;

    for (let i = 0; i < sortedPluralForms.length; i++) {
      let form = sortedPluralForms[i];
      let messageId = Math.min(i, maxMessageId);
      this.map.set(form, messageId);
    }
  }

  getMessageIndex(count) {
    let pluralForm = this.pluralRules.select(count);

    return this.map.has(pluralForm) ? this.map.get(pluralForm) : 0;
  }
}

module.exports = {
  validatePluralFormFormat,
};
