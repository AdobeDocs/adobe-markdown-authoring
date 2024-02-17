import StateCore from "markdown-it/lib/rules_core/state_core";
import { TokenType } from "../index";

/**
 * DNL (Do Not Localize) transformation rule. Simply strips the [!DNL <text>] markdown
 * and leaves the <text> part.
 * @param {} state
 */

export function transformDNL(state: StateCore) {
  let inlineTokens = state.tokens.filter(
    (tok) => tok.type === TokenType.INLINE
  );
  const dnlRegex = /\[\!DNL\s+([^\]]+)\]/;
  for (var i = 0, l = inlineTokens.length; i < l; i++) {
    // Check for all instances of dnlRegex and replace with the text
    // between the brackets.
    let text = inlineTokens[i].content;
    let match = dnlRegex.exec(text);
    while (match) {
      text = text.replace(match[0], match[1]);
      match = dnlRegex.exec(text);
    }
    inlineTokens[i].content = text;
  }
}
