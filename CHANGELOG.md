## v0.4.0 (2021-07-13)

#### :boom: Breaking Change
* `ember-l10n`
  * [#46](https://github.com/fabscale/ember-gettext/pull/46) feat: Use canonical region locale names (e.g. `en-US` instead of `en_US`) ([@mydea](https://github.com/mydea))
* `gettext-parser`
  * [#45](https://github.com/fabscale/ember-gettext/pull/45) feat: Remove charset from JSON & only keep minimal headers ([@mydea](https://github.com/mydea))
* `ember-l10n`, `gettext-parser`
  * [#44](https://github.com/fabscale/ember-gettext/pull/44) Use `Intl.PluralRules()` instead of regex for plural-forms header ([@mydea](https://github.com/mydea))

#### :rocket: Enhancement
* `ember-l10n`
  * [#46](https://github.com/fabscale/ember-gettext/pull/46) feat: Use canonical region locale names (e.g. `en-US` instead of `en_US`) ([@mydea](https://github.com/mydea))
* `gettext-parser`
  * [#45](https://github.com/fabscale/ember-gettext/pull/45) feat: Remove charset from JSON & only keep minimal headers ([@mydea](https://github.com/mydea))
* `ember-l10n`, `gettext-parser`
  * [#44](https://github.com/fabscale/ember-gettext/pull/44) Use `Intl.PluralRules()` instead of regex for plural-forms header ([@mydea](https://github.com/mydea))

#### :bug: Bug Fix
* `ember-l10n`
  * [#43](https://github.com/fabscale/ember-gettext/pull/43) fix: Ensure document lang setting is properly ignored on fastboot ([@mydea](https://github.com/mydea))

#### Committers: 1
- Francesco Novy ([@mydea](https://github.com/mydea))

## v0.3.4 (2021-07-02)

#### :house: Internal
* `gettext-parser`
  * [#29](https://github.com/fabscale/ember-gettext/pull/29) chore(deps): bump @babel/parser from 7.14.4 to 7.14.7 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#28](https://github.com/fabscale/ember-gettext/pull/28) chore(deps): bump @glimmer/syntax from 0.79.3 to 0.80.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* `ember-l10n`, `gettext-parser`
  * [#42](https://github.com/fabscale/ember-gettext/pull/42) Update dev dependencies ([@mydea](https://github.com/mydea))
* `ember-l10n`
  * [#32](https://github.com/fabscale/ember-gettext/pull/32) chore(deps): bump ember-fetch from 8.0.4 to 8.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#39](https://github.com/fabscale/ember-gettext/pull/39) chore(deps): bump broccoli-funnel from 3.0.6 to 3.0.8 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#25](https://github.com/fabscale/ember-gettext/pull/25) Update dev dependencies to latest versions ([@mydea](https://github.com/mydea))

#### Committers: 1
- Francesco Novy ([@mydea](https://github.com/mydea))

## v0.3.3 (2021-05-20)

#### :rocket: Enhancement
* `ember-l10n`
  * [#11](https://github.com/fabscale/ember-gettext/pull/11) Set lang attribute on HTML tag ([@mydea](https://github.com/mydea))

#### :bug: Bug Fix
* `ember-l10n`
  * [#12](https://github.com/fabscale/ember-gettext/pull/12) Ensure asset map creation works for embroider ([@mydea](https://github.com/mydea))

#### Committers: 1
- Francesco Novy ([@mydea](https://github.com/mydea))

## v0.3.2 (2021-05-18)

#### :rocket: Enhancement
* `ember-l10n`, `gettext-parser`
  * [#10](https://github.com/fabscale/ember-gettext/pull/10) Show new/removed term count when extracting ([@mydea](https://github.com/mydea))

#### Committers: 1
- Francesco Novy ([@mydea](https://github.com/mydea))

## v0.3.1 (2021-05-12)

#### :bug: Bug Fix
* `gettext-parser`
  * [#9](https://github.com/fabscale/ember-gettext/pull/9) Do not warn on placeholders inside of complex placeholders ([@mydea](https://github.com/mydea))

#### Committers: 1
- Francesco Novy ([@mydea](https://github.com/mydea))

## v0.3.0 (2021-05-11)

#### :rocket: Enhancement
* `ember-l10n`
  * [#7](https://github.com/fabscale/ember-gettext/pull/7) feat: Refactor locale import strategy ([@mydea](https://github.com/mydea))

#### :memo: Documentation
* `ember-l10n`
  * [#8](https://github.com/fabscale/ember-gettext/pull/8) chore: Improve documentation ([@mydea](https://github.com/mydea))

#### Committers: 1
- Francesco Novy ([@mydea](https://github.com/mydea))

## v0.2.2 (2021-05-10)

#### :bug: Bug Fix
* `ember-l10n`, `gettext-parser`
  * [#6](https://github.com/fabscale/ember-gettext/pull/6) fix: Ensure translation files are created if they do not exist ([@mydea](https://github.com/mydea))

#### Committers: 1
- Francesco Novy ([@mydea](https://github.com/mydea))

## v0.2.1 (2021-05-10)

#### :rocket: Enhancement
* `ember-l10n`
  * [#5](https://github.com/fabscale/ember-gettext/pull/5) Improve locale file generation ([@mydea](https://github.com/mydea))

#### Committers: 1
- Francesco Novy ([@mydea](https://github.com/mydea))

## v0.2.0 (2021-05-10)

#### :bug: Bug Fix
* `ember-l10n`
  * [#1](https://github.com/fabscale/ember-gettext/pull/1) fix: Fix linting & package name change ([@mydea](https://github.com/mydea))

#### :house: Internal
* `ember-l10n`
  * [#4](https://github.com/fabscale/ember-gettext/pull/4) chore: Setup CI job for ember-l10n ([@mydea](https://github.com/mydea))
  * [#2](https://github.com/fabscale/ember-gettext/pull/2) Fix missing package rename reference ([@mydea](https://github.com/mydea))
* Other
  * [#3](https://github.com/fabscale/ember-gettext/pull/3) chore: Setup dependabot config ([@mydea](https://github.com/mydea))

#### Committers: 1
- Francesco Novy ([@mydea](https://github.com/mydea))

