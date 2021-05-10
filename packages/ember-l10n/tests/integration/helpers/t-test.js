import { render, settled } from '@ember/test-helpers';
import { mockLocale } from 'dummy/tests/helpers/mock-locale';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Helper | t', function (hooks) {
  setupRenderingTest(hooks);

  test('it works without placeholders', async function (assert) {
    await render(hbs`{{t 'this is it. '}}`);

    assert.dom(this.element).hasText('this is it. ');
  });

  test('it works with a single placeholder', async function (assert) {
    await render(hbs`{{t 'this is it: {{name}} ' name='John'}}`);

    assert.dom(this.element).hasText('this is it: John ');
  });

  test('it works with multiple placeholders', async function (assert) {
    await render(
      hbs`{{t 'this is it: {{firstName}} {{lastName}} ' firstName='John' lastName='Doe'}}`
    );

    assert.dom(this.element).hasText('this is it: John Doe');
  });

  test('it works without placeholders & a provided translation', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');
    mockLocale(l10n, { 'this is it.': 'Das ist es.' });

    await render(hbs`{{t 'this is it.'}}`);

    assert.dom(this.element).hasText('Das ist es.');
  });

  test('it works with a single placeholder & a provided translation', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');
    mockLocale(l10n, { 'this is it: {{name}}': 'Das ist es: {{name}}' });

    await render(hbs`{{t 'this is it: {{name}}' name='John'}}`);

    assert.dom(this.element).hasText('Das ist es: John');
  });

  test('it works with multiple placeholders & a provided translation', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');
    mockLocale(l10n, {
      'this is it: {{firstName}} {{lastName}}':
        'Das ist es: {{firstName}} {{lastName}}',
    });

    await render(
      hbs`{{t 'this is it: {{firstName}} {{lastName}}' firstName='John' lastName='Doe'}}`
    );

    assert.dom(this.element).hasText('Das ist es: John Doe');
  });

  test('it updates when translations change', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    await render(hbs`{{t 'this is it: {{name}}' name='John'}}`);

    assert.dom(this.element).hasText('this is it: John');

    mockLocale(l10n, { 'this is it: {{name}}': 'Das ist es: {{name}}' });
    await settled();

    assert.dom(this.element).hasText('Das ist es: John');
  });

  test('it works with a context', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    await render(hbs`{{t 'this is it: {{name}}' 'test context' name='John'}}`);

    assert.dom(this.element).hasText('this is it: John ');

    mockLocale(l10n, { 'this is it: {{name}}': 'Das ist es: {{name}}' });
    await settled();

    assert.dom(this.element).hasText('this is it: John ');

    mockLocale(
      l10n,
      { 'this is it: {{name}}': 'Das ist es: {{name}}' },
      'test context'
    );
    await settled();

    assert.dom(this.element).hasText('Das ist es: John ');
  });
});
