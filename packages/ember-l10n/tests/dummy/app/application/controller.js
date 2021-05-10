import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  @service l10n;

  @tracked name = 'Francesco';
  @tracked count = 0;

  get translatedMessage() {
    return this.l10n.t('Hello world!');
  }

  @action
  async selectLocale(locale) {
    await this.l10n.setLocale(locale);
    console.log('locale set', this.l10n.locale);

    console.log(this.l10n.t('test thingy'));
    console.log(this.l10n.t('My name is {{name}}.', { name: 'john doe' }));
    console.log(
      this.l10n.n(
        'My name is {{name}} {{count}}.',
        'my names are {{name}} {{count}}.',
        1,
        { name: 'john doe' }
      )
    );
  }

  @action
  updateName(event) {
    this.name = event.target.value;
  }

  @action
  updateCount() {
    this.count++;
  }
}
