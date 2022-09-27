const PLURAL_FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];

// NOTE: Keep in sync with packages/gettext-parser/lib/utils/validate/validate-plural-form-format.js
export class PluralFactory {
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

    // If Intl.PluralRules has more plural forms than PO, we use the last one (usually many or other) for any "higher" form
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
