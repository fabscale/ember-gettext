import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { mockLocale } from 'dummy/tests/helpers/mock-locale';
import { settled } from '@ember/test-helpers';

module('Integration | Component | l10n-message', function (hooks) {
  setupRenderingTest(hooks);

  test('it works without tags', async function (assert) {
    await render(hbs`<L10nMessage
      @message={{t 'Hello: {{name}}' name='John Doe'}}
    />`);

    assert.dom(this.element).hasText('Hello: John Doe');
  });

  test('it works with one tag', async function (assert) {
    await render(hbs`<L10nMessage
      @message={{t 'Click {{#1}}link{{/1}} to continue.'}}
    >
      <:first as |text|>
        <a href='#'>{{text}}</a>
      </:first>
    </L10nMessage>`);

    assert.dom(this.element).hasText('Click link to continue.');
    assert.dom('a').exists();
    assert.dom('a').hasText('link');
  });

  test('it works with tag at start of message', async function (assert) {
    await render(hbs`<L10nMessage
      @message={{t '{{#1}}link{{/1}} to continue.'}}
    >
      <:first as |text|>
        <a href='#'>{{text}}</a>
      </:first>
    </L10nMessage>`);

    assert.dom(this.element).hasText('link to continue.');
    assert.dom('a').exists();
    assert.dom('a').hasText('link');
  });

  test('it works with tag at end of message', async function (assert) {
    await render(hbs`<L10nMessage
      @message={{t 'Click {{#1}}link{{/1}}'}}
    >
      <:first as |text|>
        <a href='#'>{{text}}</a>
      </:first>
    </L10nMessage>`);

    assert.dom(this.element).hasText('Click link');
    assert.dom('a').exists();
    assert.dom('a').hasText('link');
  });

  test('it works with two tags', async function (assert) {
    await render(hbs`<L10nMessage
      @message={{t 'Click {{#1}}link{{/1}} or {{# 2 }}other link{{/ 2 }} to continue.'}}
    >
      <:first as |text|>
        <a href='#' data-test-first>{{text}}</a>
      </:first>

      <:second as |text|>
        <a href='#' data-test-second>{{text}}!!</a>
      </:second>
    </L10nMessage>`);

    assert.dom(this.element).hasText('Click link or other link!! to continue.');
    assert.dom('a').exists({ count: 2 });
    assert.dom('[data-test-first]').hasText('link');
    assert.dom('[data-test-second]').hasText('other link!!');
  });

  test('it works with three tags', async function (assert) {
    await render(hbs`<L10nMessage
      @message={{t 'Click {{#1}}link{{/1}} or {{# 2 }}other link{{/ 2 }} or {{#3}}final link{{/3}} to continue.'}}
    >
      <:first as |text|>
        <a href='#' data-test-first>{{text}}</a>
      </:first>

      <:second as |text|>
        <a href='#' data-test-second>{{text}}!!</a>
      </:second>

      <:third as |text|>
      <a href='#' data-test-third>{{text}}</a>
    </:third>
    </L10nMessage>`);

    assert
      .dom(this.element)
      .hasText('Click link or other link!! or final link to continue.');
    assert.dom('a').exists({ count: 3 });
    assert.dom('[data-test-first]').hasText('link');
    assert.dom('[data-test-second]').hasText('other link!!');
    assert.dom('[data-test-third]').hasText('final link');
  });

  test('it re-computed when locale changes', async function (assert) {
    let l10n = this.owner.lookup('service:l10n');

    await render(hbs`<L10nMessage
      @message={{t 'Click {{#1}}link{{/1}} to continue.'}}
    >
      <:first as |text|>
        <a href='#'>{{text}}</a>
      </:first>
    </L10nMessage>`);

    assert.dom(this.element).hasText('Click link to continue.');
    assert.dom('a').exists();
    assert.dom('a').hasText('link');

    mockLocale(l10n, {
      'Click {{#1}}link{{/1}} to continue.':
        'Klicke {{#1}}Link{{/1}} zum Fortfahren.',
    });
    await settled();

    assert.dom(this.element).hasText('Klicke Link zum Fortfahren.');
    assert.dom('a').exists();
    assert.dom('a').hasText('Link');
  });

  test('it works with empty tag', async function (assert) {
    await render(hbs`<L10nMessage
      @message={{t 'Click {{#1}}{{/1}} to continue.'}}
    >
      <:first>
        <a href='#'>link</a>
      </:first>
    </L10nMessage>`);

    assert.dom(this.element).hasText('Click link to continue.');
    assert.dom('a').exists();
    assert.dom('a').hasText('link');
  });
});
