import { render, settled } from '@ember/test-helpers';
import { mockLocale } from 'dummy/tests/helpers/mock-locale';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Helper | n', function (hooks) {
  setupRenderingTest(hooks);

  test('it works without placeholders and count 0', async function (assert) {
    await render(hbs`{{n 'this is one' 'this is multiple' 0}}`);

    assert.dom(this.element).hasText('this is multiple');
  });

  test('it works without placeholders and count 1', async function (assert) {
    await render(hbs`{{n 'this is one' 'this is multiple' 1}}`);

    assert.dom(this.element).hasText('this is one');
  });

  test('it works without placeholders and count 2', async function (assert) {
    await render(hbs`{{n 'this is one' 'this is multiple' 2}}`);

    assert.dom(this.element).hasText('this is multiple');
  });

  test('it works without placeholders and count -1', async function (assert) {
    await render(hbs`{{n 'this is one' 'this is multiple' -1}}`);

    assert.dom(this.element).hasText('this is one');
  });

  test('it automatically provides count placeholder', async function (assert) {
    await render(
      hbs`{{n 'this is one {{count}}' 'this is multiple {{count}}' 2}}`
    );

    assert.dom(this.element).hasText('this is multiple 2');
  });

  test('it works with a placeholder and count 1', async function (assert) {
    await render(
      hbs`{{n '{{count}} item: {{name}}' '{{count}} items: {{name}}' 1 name='John'}}`
    );

    assert.dom(this.element).hasText('1 item: John');
  });

  test('it works with a placeholder and count 2', async function (assert) {
    await render(
      hbs`{{n '{{count}} item: {{name}}' '{{count}} items: {{name}}' 2 name='John'}}`
    );

    assert.dom(this.element).hasText('2 items: John');
  });

  test('it works with a placeholder & a provided translation', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');
    mockLocale(l10n, {
      '{{count}} item: {{name}}': [
        '{{count}} Element: {{name}}',
        '{{count}} Elemente: {{name}}',
      ],
    });

    await render(
      hbs`{{n '{{count}} item: {{name}}' '{{count}} items: {{name}}' 2 name='John'}}`
    );

    assert.dom(this.element).hasText('2 Elemente: John');
  });

  test('it updates when translations change', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    await render(
      hbs`{{n '{{count}} item: {{name}}' '{{count}} items: {{name}}' 2 name='John'}}`
    );

    assert.dom(this.element).hasText('2 items: John');

    mockLocale(l10n, {
      '{{count}} item: {{name}}': [
        '{{count}} Element: {{name}}',
        '{{count}} Elemente: {{name}}',
      ],
    });
    await settled();

    assert.dom(this.element).hasText('2 Elemente: John');
  });

  test('it works with a context', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    await render(
      hbs`{{n '{{count}} item: {{name}}' '{{count}} items: {{name}}' 1 'test context' name='John'}}`
    );

    assert.dom(this.element).hasText('1 item: John');

    mockLocale(l10n, {
      '{{count}} item: {{name}}': [
        '{{count}} Element: {{name}}',
        '{{count}} Elemente: {{name}}',
      ],
    });
    await settled();

    assert.dom(this.element).hasText('1 item: John');

    mockLocale(
      l10n,
      {
        '{{count}} item: {{name}}': [
          '{{count}} Element: {{name}}',
          '{{count}} Elemente: {{name}}',
        ],
      },
      'test context'
    );
    await settled();

    assert.dom(this.element).hasText('1 Element: John');
  });
});
