import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "../index";

/**
 * Extract the headline from the anchor attached to a Markdown header line, for example:
 * # My headline {#my-headline}
 * and convert it to an HTML ID attribute.
 * @param state
 */
export function transformHeaderAnchors(state: StateCore) {
  let headingTokens: Token[] = state.tokens;
  const anchorMatch = /{#([^}]+)}/;
  for (var i = 0, l = headingTokens.length; i < l; i++) {
    if (headingTokens[i].type === TokenType.HEADING_OPEN) {
      const headline = headingTokens[i + 1].content;
      if (headline) {
        const ids = headline.match(anchorMatch);
        if (ids && ids[1]) {
          headingTokens[i].attrSet("id", ids[1]);
          headingTokens[i + 1].content = headline.substring(0, ids.index);
        }
      }
    }
  }
}
