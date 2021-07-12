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

export function getPluralMessage({
  messages,
  count,
  msgId,
  msgIdPlural,
  pluralFactory,
  defaultPluralFactory,
}) {
  // No translation exists for the current locale? Use default one instead
  if (messages.length === 0) {
    messages = [msgId, msgIdPlural];
    pluralFactory = defaultPluralFactory;
  }

  let messageIndex = pluralFactory.getMessageIndex(count);

  let message = messages[messageIndex];

  assert(
    `Message with index ${messageIndex} is not found for count=${count}
Message:
${msgId}
`,
    typeof message === 'string'
  );

  return message || msgId;
}
