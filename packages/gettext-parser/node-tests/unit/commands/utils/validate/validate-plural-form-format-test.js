const { expect } = require('chai');
const {
  validatePluralFormFormat,
} = require('./../../../../../lib/utils/validate/validate-plural-form-format');

// This is heavily based on: https://www.gnu.org/software/gettext/manual/html_node/Plural-forms.html
describe('validatePluralFormFormat util', function () {
  describe('throws on errors', function () {
    it(`it throws on invalid format for de`, function () {
      expect(() =>
        validatePluralFormFormat('nplurals=1; plural=0;', 'de')
      ).to.throw(
        'plural-form header does not match Intl.PluralRules(). Parsed plural for 0 is one, but should be other'
      );
    });
  });

  describe('only one form', function () {
    ['ko', 'ja', 'vi', 'zh'].forEach((locale) => {
      it(`it works for ${locale}`, function () {
        validatePluralFormFormat('nplurals=1; plural=0;', locale);
      });
    });
  });

  describe('two forms, singular used for one only', function () {
    ['en', 'de', 'nl', 'sv', 'no', 'it', 'es', 'el', 'hu', 'tr'].forEach(
      (locale) => {
        it(`it works for ${locale}`, function () {
          validatePluralFormFormat('nplurals=2; plural=(n != 1);', locale);
        });
      }
    );
  });

  describe('two forms, singular used for zero and one', function () {
    ['pt', 'fr'].forEach((locale) => {
      it(`it works for ${locale}`, function () {
        validatePluralFormFormat('nplurals=2; plural=n>1;', locale);
      });
    });
  });

  describe('three forms, special cases for numbers ending in 1 and 2, 3, 4, except those ending in 1[1-4]', function () {
    ['ru', 'uk', 'sr', 'hr'].forEach((locale) => {
      it(`it works for ${locale}`, function () {
        validatePluralFormFormat(
          'nplurals=3; plural=n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2;',
          locale
        );
      });
    });
  });

  describe('six forms, special cases for one, two, all numbers ending in 02, 03, … 10, all numbers ending in 11 … 99, and other', function () {
    ['ar'].forEach((locale) => {
      it(`it works for ${locale}`, function () {
        validatePluralFormFormat(
          ' nplurals=6; plural=n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5;',
          locale
        );
      });
    });
  });
});
