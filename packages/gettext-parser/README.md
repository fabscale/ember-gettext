# @ember-gettext/gettext-parser

Use the gettext (po) translation format to provide translations for your Ember app.

Parse [gettext](https://www.gnu.org/software/gettext/) messages from `.hbs`, `.js` and `.ts` files and generate `.pot` and `.po` files from it.

These can then be translated via a translation tool of your choice, and then converted into `.json` files which can be deployed with your application.

## Compatibility

- Ember CLI v2.13 or above
- Node.js v14 or above

## Installation

```bash
ember install @ember-gettext/gettext-parser
```

## Usage

### Extraction

You can extract translations with `ember gettext:extract`. Use `ember help gettext:extract` to see all available options.

By default, it will extract all filed from `./app`, as well as all `./addon` and `./app` files from any installed addon that has `ember-l10n` as a dependency.

You can use these configuration options:

```
# Use different or multiple input directories
--input-dirs ./app --input-dirs ./other-folder

# Only include files matching the given patterns. 
--include-patterns templates/landing --include-patterns templates/welcome

# Exclude files matching the given patterns
--exclude-patterns mirage --exclude-patterns fixtures

# Do not extract from these addons
--skip-dependencies styleguide-addon --skip-dependencies test-addon

# Use this as the locale of messageIds (defaults to en)
--locale de

# Use a different file to store the pot information (not recommended)
--pot-name my-message.pot

# Use a different output directory (not recommended)
--output-dir ./other
```