import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import click from '@ember/test-helpers/dom/click';

module('Acceptance | l10n', function (hooks) {
  setupApplicationTest(hooks);

  test('it works', async function (assert) {
    await visit('/');

    assert.equal(currentURL(), '/');

    let l10n = this.owner.lookup('service:l10n');

    assert.equal(l10n.locale, 'en', 'locale is en initially');
    assert.dom(document.documentElement).hasAttribute('lang', 'en');
    assert.dom('[data-test-message]').hasText('Hello world!');

    await click('[data-test-locale-de]');

    assert.equal(l10n.locale, 'de', 'locale is de');
    assert.dom(document.documentElement).hasAttribute('lang', 'de');
    assert.dom('[data-test-message]').hasText('Hallo Welt!');
  });
});
