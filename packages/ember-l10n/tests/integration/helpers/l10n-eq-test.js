import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | l10n-eq', function (hooks) {
  setupRenderingTest(hooks);

  test('it works with non-equal values', async function (assert) {
    await render(hbs`{{l10n-eq 1 2}}`);

    assert.dom(this.element).hasText('false');
  });

  test('it works with equal values', async function (assert) {
    await render(hbs`{{l10n-eq 1 1}}`);

    assert.dom(this.element).hasText('true');
  });

  test('it checks types', async function (assert) {
    await render(hbs`{{l10n-eq 1 '1'}}`);

    assert.dom(this.element).hasText('false');
  });
});
