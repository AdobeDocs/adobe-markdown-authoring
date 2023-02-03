import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";
/**
 * Look for lines that begin with "+++".  These lines delimit a collapsible section of the document. Replace the
 * "+++" with a <details> opening and a </details> closing tag surrounding the collapible section.  Place the text
 * after the "+++" in a <summary> tag.
 * @param {*} state
 */
export function transformCollapsible(state: StateCore) {
  let tokens = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token.type === "inline") {
      let text = token.content;
      // Find the opening +++ line.
      if (text.startsWith("+++")) {
        let collapsibleText = text.substring(3).trim();
        let [title, content] = collapsibleText.split("\n");
        let summaryToken = new Token("html_block", "", 0);
        summaryToken.content = `<summary>${title}</summary>`;
        let detailsToken = new Token("html_block", "", 0);
        detailsToken.content = "<details>";
        tokens.splice(i - 1, 2, detailsToken); // replace the opening paragraph and the +++ line with the <details> tag
        tokens.splice(i, 0, summaryToken); // insert the <summary> tag
        if (content) {
          let contentToken = new Token("html_block", "", 0);
          contentToken.content = content;
          tokens.splice(i + 1, 0, contentToken); // insert the content token
        }
        // Find the closing +++ line.
        i += 2; // skip the opening <details> tag and the <summary> tag
        while (i < tokens.length) {
          let nextToken = tokens[i];
          if (nextToken.type === TokenType.INLINE) {
            text = nextToken.content;
            if (text.startsWith("+++")) {
              let endDetailsToken = new Token("html_block", "", 0);
              endDetailsToken.content = "</details>";
              tokens.splice(i, 1, endDetailsToken);
              break;
            }
          }
          i++;
        }
      }
    }
  }
}
