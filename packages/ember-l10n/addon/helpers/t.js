import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';

export default class THelper extends Helper {
  @service l10n;

  compute([messageId, messageContext = ''], hash) {
    assert(
      `{{n}}: The first argument (messageId) has to be a string`,
      typeof messageId === 'string'
    );
    assert(
      `{{n}}: The second argument (context) has to be a string`,
      typeof messageContext === 'string'
    );

    return this.l10n.tVar(messageId, Object.assign(hash), messageContext);
  }
}
