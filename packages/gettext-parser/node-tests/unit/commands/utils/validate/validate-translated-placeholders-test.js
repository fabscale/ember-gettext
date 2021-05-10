const { expect } = require('chai');
const {
  validateTranslatedPlaceholders,
} = require('./../../../../../lib/utils/validate/validate-translated-placeholders');

describe('validateTranslatedPlaceholders util', function () {
  it('it works for empty id', function () {
    let validationErrors = [];
    let gettextItem = {
      id: '',
      translations: [],
    };
    validateTranslatedPlaceholders(gettextItem, validationErrors);

    let expected = [];
    expect(validationErrors).to.deep.equal(expected);
  });

  it('it works without translated placeholders', function () {
    let validationErrors = [];
    let gettextItem = {
      id: 'My test {{val}}',
      translations: ['My test {{val}}'],
    };
    validateTranslatedPlaceholders(gettextItem, validationErrors);

    let expected = [];
    expect(validationErrors).to.deep.equal(expected);
  });

  it('it ignores missing translations for translated placeholders', function () {
    let validationErrors = [];
    let gettextItem = {
      id: 'My test {{#1}}test{{/1}}',
      translations: [''],
    };
    validateTranslatedPlaceholders(gettextItem, validationErrors);

    let expected = [];
    expect(validationErrors).to.deep.equal(expected);
  });

  it('it works with correct translated placeholders for default language', function () {
    let validationErrors = [];
    let gettextItem = {
      id: 'My test {{#1}}test{{/1}}',
      translations: ['My test {{#1}}test{{/1}}'],
    };
    validateTranslatedPlaceholders(gettextItem, validationErrors);

    let expected = [];
    expect(validationErrors).to.deep.equal(expected);
  });

  it('it works with correct translated placeholders for other language', function () {
    let validationErrors = [];
    let gettextItem = {
      id: 'My test {{#1}}test{{/1}}',
      translations: ['Mein test {{#1}}Test{{/1}}'],
    };
    validateTranslatedPlaceholders(gettextItem, validationErrors);

    let expected = [];
    expect(validationErrors).to.deep.equal(expected);
  });

  it('it works with multiple translated placeholders for other language', function () {
    let validationErrors = [];
    let gettextItem = {
      id: 'My test {{#1}}test{{/1}} and {{#2}}other{{/2}}',
      translations: ['Mein test {{#1}}Test{{/1}} und {{#2}}Anderes{{/2}}'],
    };
    validateTranslatedPlaceholders(gettextItem, validationErrors);

    let expected = [];
    expect(validationErrors).to.deep.equal(expected);
  });

  it('it works with incorrect translated placeholders for other language', function () {
    let validationErrors = [];
    let gettextItem = {
      id: 'My test {{#1}}test{{/1}}',
      translations: ['Mein test {{#1}}test{{/1}}'],
    };
    validateTranslatedPlaceholders(gettextItem, validationErrors);

    let expected = [
      {
        id: 'My test {{#1}}test{{/1}}',
        level: 'WARNING',
        message:
          'The content "test" for complex placeholder "1" is not translated',
        translation: 'Mein test {{#1}}test{{/1}}',
      },
    ];
    expect(validationErrors).to.deep.equal(expected);
  });

  it('it works with one of multiple incorrect translated placeholders for other language', function () {
    let validationErrors = [];
    let gettextItem = {
      id: 'My test {{#1}}test{{/1}} and {{#2}}others{{/2}}',
      translations: ['Mein test {{#1}}Test{{/1}} and {{#2}}others{{/2}}'],
    };
    validateTranslatedPlaceholders(gettextItem, validationErrors);

    let expected = [
      {
        id: 'My test {{#1}}test{{/1}} and {{#2}}others{{/2}}',
        level: 'WARNING',
        message:
          'The content "others" for complex placeholder "2" is not translated',
        translation: 'Mein test {{#1}}Test{{/1}} and {{#2}}others{{/2}}',
      },
    ];
    expect(validationErrors).to.deep.equal(expected);
  });

  it('it works with changed placeholder names', function () {
    let validationErrors = [];
    let gettextItem = {
      id: 'My test {{#1}}test{{/1}}',
      translations: ['Mein test {{#2}}Test{{/2}}'],
    };
    validateTranslatedPlaceholders(gettextItem, validationErrors);

    let expected = [
      {
        id: 'My test {{#1}}test{{/1}}',
        level: 'ERROR',
        message: 'The complex placeholder "1" is not correctly translated',
        translation: 'Mein test {{#2}}Test{{/2}}',
      },
    ];
    expect(validationErrors).to.deep.equal(expected);
  });
});
