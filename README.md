# ember-gettext

Packages to work with gettext-based translations in Ember apps.

These packages follow the [gettext](https://www.gnu.org/software/gettext/) convention that the message ids in your source files are the default language (usually English).

## How it works

There are separate packages which offer specialized functionality to work with gettext translations.

You can use [ember-l10n](./packages/ember-l10n) to use translated messages in your application. Based on the gettext convention, you provide message ids that also function as the default translation (usually English). This means that you can immediately use the application with your default locale.

You can then use [gettext-parser](./packages/gettext-parser) to extract all the translation messages from your source code into a `messages.pot` file. This file can then be given to translators or imported into any tool that can handle gettext translations.

The translation tools will then give you a translated `.po` file, e.g. `de.po` for the German translation. This file can be put into your apps `./translation` folder, and can then be converted into `.json` file suiteable for your Ember app to consume.

## Extracting translations

Use `@ember-gettext/gettext-parser` to extract messages from your source files.

See [gettext-parser README](./packages/gettext-parser/README.md) for details.

### Installation

```bash
ember install @ember-gettext/gettext-parser
```

### Usage

```bash
# Extract source files into messages.pot, to provide to translators
ember gettext:extract

# Generate usable .json file for application for translated .po files
ember gettext:convert --locale=de
```

## Using translations in your app

Use `@ember-gettext/ember-l10n` to translate messages in your Ember app.

See [ember-l10n README](./packages/ember-l10n/README.md) for details.

### Installation

```bash
ember install @ember-gettext/ember-l10n
```

### Configuration

You configure ember-l10n in your `environment.js` file like this:

```js
// config/environment.js
let ENV = {
  // ...
  '@ember-gettext/ember-l10n': {
    locales: ['en', 'de', 'ko'],
    defaultLocale: 'en',
  },
};
```

### Usage

#### In Handlebars templates

```hbs
<p>
  {{t 'Hello {{name}}' name=@userName}}
</p>
<p>
  {{n
    '{{count}} item in cart.'
    '{{count}} items in cart.'
    @itemCount
  }}
</p>
```

#### In JavaScript classes

```js
export default class Component {
  @service l10n;

  get welcomeMessage() {
    return this.l10n.t('Hello {{name}}', { name: this.args.userName });
  }
}
```
