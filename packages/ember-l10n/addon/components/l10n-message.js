import Component from '@glimmer/component';
import { assert } from '@ember/debug';

/**
 * A simple helper component to include dynamic parts - mostly link-to helper - within gettext message ids.
 *
 * ```html
 * <GetText @message={{t "My translation with {{dynamicLink 'optional link text'}} and {{staticLink}}"}} as |text placeholder|>
 *  {{!-- You can omit the if helper if you have only one dynamic part --}}
 *  {{~#if (eq placeholder 'myLink')}}
 *    {{~#link-to 'my-route'}}
 *      {{~text}} {{!-- will render 'optional link text' so that it's contained in PO file! --}}
 *    {{~/link-to~}}
 *  {{~/if~}}
 *  {{~#if (eq placeholder 'staticLink')}}
 *    <a href="http://www.google.com">Google</a>
 *  {{~/if~}}
 * </GetText>
 * ```
 */
export default class L10nMessageComponent extends Component {
  // -------------------------------------------------------------------------
  // Attributes

  /**
   * The message id string, which should use one of the gettext
   * translations method as subexpression when being passed in!
   *
   * @attribute message
   * @type {String}
   * @public
   */
  message;

  // -------------------------------------------------------------------------
  // Properties

  get parts() {
    let { message } = this.args;

    assert(
      `<L10nMessage>: You have to provide an @message that is a string.`,
      typeof message === 'string' || typeof message?.toString === 'function'
    );

    // match: {{#1}}text{{/2}}
    let regex = /{{#\s*(\d+)\s*}}(.*){{\/\s*(\1+)\s*}}/gm;

    let parts = [];

    let lastPos = 0;
    let m;
    while ((m = regex.exec(message)) !== null) {
      let start = m.index;
      let end = regex.lastIndex;

      let previousText = message.substring(lastPos, start);

      if (previousText) {
        parts.push({ pos: null, text: previousText });
      }

      let pos = parseInt(m[1]);
      let text = m[2];

      assert(
        `<L10nMessage>: You can only provide placeholders from {{#1}} to {{#3}}, but you used {{#${m[1]}}}`,
        [1, 2, 3].includes(pos)
      );

      parts.push({
        pos,
        text,
      });

      lastPos = end;
    }

    if (lastPos < message.length) {
      parts.push({
        pos: null,
        text: message.substring(lastPos),
      });
    }

    return parts;
  }
}
