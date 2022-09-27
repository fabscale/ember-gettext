// Takes something like: nplurals=2; plural=(n != 1); or nplurals=1; plural=0;
// And parses our the `nplurals=X` part
module.exports = function parsePluralFormsCount(pluralForm) {
  if (!pluralForm) {
    return undefined;
  }

  let regex = /nplurals(\s*)=(\s*)(\d+);/;

  let match = pluralForm.match(regex);

  if (!match) {
    return undefined;
  }

  let nplurals = parseInt(match[3]);

  if (Number.isNaN(nplurals)) {
    return undefined;
  }

  return nplurals;
};
