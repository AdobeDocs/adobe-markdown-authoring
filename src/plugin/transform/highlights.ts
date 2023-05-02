import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

/**
 * Highlights transformation rule. Looks for HTML code <div class="preview">
 * in the INLINE tokens and replaces it with an HTML_BLOCK token with the same contents
 * so that it is preserved in the tokens array.
 * @param {} state
 */

export function transformHighlights(state: StateCore) {
  let inlineTokens = state.tokens.filter(
    (tok) => tok.type === TokenType.INLINE
  );
  const highlightRegex = /(<div class="preview">[\s\S]*?<\/div>)/;
  for (var i = 0, l = inlineTokens.length; i < l; i++) {
    // Check for all instances of highlightRegex and replace with an HTML_BLOCK token
    let text = inlineTokens[i].content;
    let match = highlightRegex.exec(text);
    while (match) {
      let newToken = new Token(TokenType.HTML_BLOCK, "", 1);
      newToken.content = match[0];
      text = text.replace(match[0], "");
      match = highlightRegex.exec(text);

      inlineTokens.splice(i, 0, newToken);
      l++;
      i++;
    }
    inlineTokens[i].content = text;
  }
}
