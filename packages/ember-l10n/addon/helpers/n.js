import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';

export default class NHelper extends Helper {
  @service l10n;

  compute([messageId, messageIdPlural, count, messageContext = ''], hash) {
    assert(
      `{{n}}: The first argument (messageId) has to be a string`,
      typeof messageId === 'string'
    );
    assert(
      `{{n}}: The second argument (messageIdPlural) has to be a string`,
      typeof messageIdPlural === 'string'
    );
    assert(
      `{{n}}: The third argument (count) has to be a number`,
      typeof count === 'number'
    );
    assert(
      `{{n}}: The fourth argument (context) has to be a string`,
      typeof messageContext === 'string'
    );

    return this.l10n.nVar(
      messageId,
      messageIdPlural,
      count,
      Object.assign(hash),
      messageContext
    );
  }
}
