import { assert } from '@ember/debug';

export function replacePlaceholders(string, hash) {
  assert(
    `ember-l10n: hash for translations has to be an object, but is ${hash}`,
    typeof hash === 'object'
  );

  // find all: {{placeholderName}}
  let pattern = /{{\s*([\w]+)\s*}}/g;

  return string.replace(pattern, (_, match) => {
    let value = hash[match];

    assert(
      `ember-l10n: No value given for placeholder "{{${match}}}" in message: \n${string}`,
      typeof value !== 'undefined'
    );

    return typeof value !== 'undefined' ? value : `{{${match}}}`;
  });
}

export function sanitizeMessageId(messageId) {
  assert(
    `ember-l10n: messageIds should be a string`,
    typeof messageId === 'string'
  );

  return messageId.replace(/\s+/g, ' ');
}

/**
 * Normalize the message ids in the JSON response
 * Otherwise, the lookup in this._getMessages() can sometimes fail.
 * The new extraction functionality leaves (some) whitespace intact, making message ids with e.g. newlines possible.
 * This breaks when looking up message keys.
 * To fix this, we normalize all message ids to plain whitespace.
 * Newlines and other whitespace in the message content remains intact.
 * This also ensures that with changing whitespace, messages will still be found later.
 */
export function sanitizeJSON(json) {
  let { translations } = json;
  let sanitizedTranslations = {};

  Object.keys(translations).forEach((context) => {
    let items = translations[context];
    sanitizedTranslations[context] = {};

    Object.keys(items).forEach((messageId) => {
      let item = items[messageId];
      let sanitizedMessageId = sanitizeMessageId(messageId);

      sanitizedTranslations[context][sanitizedMessageId] = Object.assign(
        {},
        item,
        {
          msgid: sanitizedMessageId,
        }
      );
    });
  });

  return Object.assign({}, json, { translations: sanitizedTranslations });
}

// Takes something like: nplurals=2; plural=(n != 1); or nplurals=1; plural=0;
export function setupPluralFactory(pluralForm, defaultPluralForm) {
  let regex =
    /^\s*nplurals=\s*(\d+)\s*;\s*plural\s*=\s*([-+*/%?!&|=<>():;n\d\s]+);$/;

  if (!pluralForm || !pluralForm.match(regex)) {
    console.error(
      `Plural form "${pluralForm}" is invalid: 'nplurals=NUMBER; plural=EXPRESSION;' - falling back to ${defaultPluralForm}!`
    );
    pluralForm = defaultPluralForm;
  }

  let maxMessageIndex, pluralExpression;
  let m;
  if ((m = regex.exec(pluralForm)) !== null) {
    maxMessageIndex = m[1] * 1 - 1;
    pluralExpression = m[2];
  }

  // eslint-disable-next-line no-unused-vars
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

export function getMessages(l10nTranslations, messageId, context = '') {
  assert(
    `ember-l10n: messageId has to be a string, but is "${messageId}"`,
    typeof messageId === 'string'
  );

  // If locale data is not yet loaded, abort here
  if (!l10nTranslations) {
    return [];
  }

  let messageItem = l10nTranslations[context]?.[messageId];
  return messageItem?.msgstr || [];
}
