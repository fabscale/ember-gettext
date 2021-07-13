const PLURAL_FORMS = ['zero', 'one', 'two', 'few', 'many', 'other'];

export class PluralFactory {
  locale;
  pluralRules;
  pluralForms;

  constructor(locale) {
    this.locale = locale;
    this.pluralRules = new Intl.PluralRules(locale);

    // We want to ensure a stable sorting
    // As this could be in any order, but gettext will try to keep a stable ordering from few->many
    let pluralForms = this.pluralRules.resolvedOptions().pluralCategories;

    this.pluralForms = PLURAL_FORMS.filter((pluralForm) =>
      pluralForms.includes(pluralForm)
    );
  }

  getMessageIndex(count) {
    let pluralForm = this.pluralRules.select(count);
    return this.pluralForms.indexOf(pluralForm);
  }
}
