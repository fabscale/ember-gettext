import localeMap from '<%= dasherizedPackageName %>/locales/index';

export function initialize(appInstance) {
  appInstance.register('ember-l10n:locales', localeMap, { instantiate: false });
}

export default {
  initialize,
};
