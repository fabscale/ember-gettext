# @ember-gettext/ember-l10n

Use the gettext (po) translation format to provide translations for your Ember app.

`ember-l10n` follows the [gettext](https://www.gnu.org/software/gettext/) convention that the message ids in your source files are the default language (usually English).

In the ember-l10n workflow, you use the `t`, and `n` helpers and `l10n.t()` / `l10n.n()` functions to define your strings in your project. Then you run the extractor to generate pot and po files, which you send off to your translators. After receiving the translated po files for additional locales, you use the same script to convert them into json files. These json files are then loaded by ember-l10n in your application and replaced at runtime.

## Compatibility

- **Embroider only!!**
- Ember.js v3.25 or above
- Ember CLI v3.20 or above
- Node.js v12 or above

This addon is optimized for Embroider. It is probably possible to also use it without Embroider, but you'll need to adjust the generated import map yourself.

## Installation

```
ember install @ember-gettext/ember-l10n
```

## Configuration

You configure ember-l10n in your `environment.js` file like this:

```js
// config/environment.js
let ENV = {
  // ...
  '@ember-gettext/ember-l10n': {
    locales: ['en', 'de', 'ko'],
    defaultLocale: 'en', // defaults value
  },
};
```

In order to ensure the locales are lazy loaded, you'll need to add this to your `ember-cli-build.js` file:

```js
return require('@embroider/compat').compatBuild(app, Webpack, {
  // Ensure `locales` are considered static & lazy loaded
  staticAppPaths: ['locales'],
});
```

## Usage

Translations are provided as `.json` files under `/app/locales`, e.g. `/app/locales/de.json`.
They can be generated with the separate parser addon.

To use translations in your app, you can use either the provided helpers, a contextual component or a service:

### Service

The provided `l10n` service can be used to both load translations as well as to provide translated messages in JS code.

In your application route, you should make sure to use `l10n.setLocale(myLocale)` to load the necessary locale files:

```js
// application/route.js

export default class ApplicationRoute extends Route {
  @service l10n;

  async beforeModel() {
    // For example, use locale from a theoretical user loaded from somewhere
    let user = await this.loadUserFromSomewhere();
    let locale = user.locale || 'en';

    await this.l10n.setLocale(locale);
  }
}
```

Then, you can use `t()` and `n()` to translate messages:

```js
l10n.t('Hello world'); // --> Hello world

l10n.n('{{count}} item', '{{count}} items', 1); // --> 1 item
l10n.n('{{count}} item', '{{count}} items', 2); // --> 2 items
```

You can also provide placeholders:

```js
l10n.t('Hello {{target}}', { target: 'world' }); // --> Hello world

l10n.n('{{count}} item for {{name}}', '{{count}} items for {{name}}', 2, {
  name: 'John',
}); // --> 2 items for John
```

Or you can provide a context:

```js
l10n.t('Hello world', {}, 'landing page'); // --> Hello world

l10n.n(
  '{{count}} item for {{name}}',
  '{{count}} items for {{name}}',
  2,
  {
    name: 'John',
  },
  'landing page'
); // --> 2 items for John
```

The same message with a different context can be translated separately,
which can be used to differentiate ambiguous texts for translators.

You can also use `tVar()` or `nVar()`, which work exactly the same as `t()` and `n()` but will not be picked up by the l10n parser.
This can be used to translate enums or similar that are translated somewhere else.
It is generally discouraged to use this, but can be useful in some narrow scenarios.

### Helpers

You can use the `{{t}}` and `{{n}}` helpers to output translations right in your templates:

```hbs
{{! Output: Hello world! }}
{{t 'Hello world!'}}

{{!Output: 1 item }}
{{n '{{count}} item' '{{count}} items' 1}}
{{!Output: 2 items }}
{{n '{{count}} item' '{{count}} items' 2}}
```

You can also provide placeholders for these helpers:

```hbs
{{! Output: Hello World }}
{{t 'Hello {{target}}' target='World'}}

{{! Output: John has 1 item }}
{{n '{{name}} has {{count}} item' '{{name}} has {{count}} items' 1 name='John'}}
```

Finally, you can also provide a context like this:

```hbs
{{! Output: Hello world }}
{{t 'Hello world' 'landing page'}}

{{! Output: 1 item }}
{{n '{{count}} item' '{{count}} items' 1 'landing page'}}
```

### Contextual component

In the case that you need to include some custom code like HTML or styling inside of a message, you can use the contextual component `<L10nMessage>` like this:

```hbs
<L10nMessage
  @message={{t
    'Options for {{name}}: {{#1}}Settings{{/1}} or {{#2}}Sign out{{/2}}'
    name='John'
  }}
>
  <:first as |text|>
    <a href='/settings'>{{text}}</a>
  </:first>

  <:second as |text|>
    <a href='/logout'>{{text}}</a>
  </:second>
</L10nMessage>
```

This component allows you to define up to three contextual placeholders: `{{#1}}`, `{{#2}}` and `{{#3}}`.
These can then be replaced via the named blocks `<:first>`, `<:second>` and `<:third>`, respectively.
Each named block receives a yielded argument which is the translated message.

From a translators perspective, they will normally translate the full message. For example:

```
en:
'Options for {{name}}: {{#1}}Settings{{/1}} or {{#2}}Sign out{{/2}}'

de:
'Optionen fuer {{name}}: {{#1}}Einstellungen{{/1}} oder {{#2}}Ausloggen{{/2}}'
```

The content of between `{{#1}}...{{/1}}`, in the example `Einstellungen`,
will be available as `{{text}}` to the named block.

### Locale files

Locale files can be generated with [gettext-parser](./../gettext-parser).

ember-l10n expects properly formatted .json files (e.g. `de.json`, `en.json`) , by default in the `./app.locales` folder of your app.

### Locale detection

You can use the included `detectLocale()` method to detect a fitting locale based on the browsers settings:

```js
export default class ApplicationRoute extends Route {
  @service l10n;

  async beforeModel() {
    let locale = this.l10n.detectLocale();

    await this.l10n.setLocale(locale);
  }
}
```

This will pick the first matching locale from the available locales for you.

## Updating from older versions

When updating from versions before 1.x, please run `ember generate ember-l10n` once to generate the required boilerplate files for you.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
