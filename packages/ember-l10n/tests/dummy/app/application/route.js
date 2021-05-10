import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service l10n;

  constructor() {
    super(...arguments);

    this.l10n.setLocale('en');
  }
}
