# @ember-gettext/gettext-parser

Use the gettext (po) translation format to provide translations for your Ember app.

Parse [gettext](https://www.gnu.org/software/gettext/) messages from `.hbs`, `.js` and `.ts` files and generate `.pot` and `.po` files from it.

These can then be translated via a translation tool of your choice, and then converted into `.json` files which can be deployed with your application.

## Compatibility

- Ember CLI v2.13 or above
- Node.js v14 or above

## Installation

```sh
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

# If enabled, new and obsolete terms will be printed to the console
--print-changes
```

### Conversion

You can convert translated `.po` files with `ember gettext:convert`. Use `ember help gettext:convert` to see all available options.

It will look for a file named `<locale>.po` in your `./translations` directory and convert it into `<locale>.json` in the output directory (default: `app/locales/<locale>.json`).

For example, if you receive a German translation of your app, you should save this file under `./translations/de.po`. Then, you would run `ember gettext:convert --locale=de`, which will generate the file `./app/locales/de.json` which can be used by ember-l10n.

Alternatively, you can also leave the `--locale` away, to convert all locale.po files.

Available options:

```
# Use different input directory
--input-dir ./translations

# Use different output directory
--output-dir ./app/locales

# Convert this locale (or all, if empty)
--locale de

# Convert this specific file (provide full path, takes precedence over input-dir)
--input-file ./my-path/file.po

# Generate/update the locale map. Set to false to skip this step
--generate-map false
```

### Generate map

You can manually generate the map for locale imports with `ember gettext:generate-map`. This takes a single optional argument:

```
# Generate for this directory
--locale-dir ./app/loclaes
```

By default, this will be run whenever you convert a file, but you can also run it manually.
