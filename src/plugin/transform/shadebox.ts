/**
 * Look for lines that begin with the regex "[!BEGINSHADEBOX ".  These lines delimit a shaded box section of the
 * document.  Replace the "[!BEGINSHADEBOX ..." with a <div class="sp-wrapper"> opening.  Then, look for the
 * corresponding "[!ENDSHADEBOX]" line and replace it with a </div> closing tag.
 * The text after the "[!BEGINSHADEBOX " is used as the title of the shaded box.
 * Note that the actual syntax begins with ">" because it is a blockquote.  We need to look for blockquotes before
 * we look for the shaded box.
 * @param {*} state
 */

import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

export function transformShadebox(state: StateCore) {
  let tokens: Token[] = state.tokens;
  let beginShadeboxRe = /\[!BEGINSHADEBOX(\s+\"(.*)\")?\]/;
  let endShadeboxRe = /\[!ENDSHADEBOX\]/;
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token.type !== TokenType.BLOCKQUOTE_OPEN) {
      continue;
    }
    // We are in a Blockquote. The next token should be a paragraph.
    let nextToken = tokens[i + 1];
    if (!(nextToken.type === TokenType.PARAGRAPH_OPEN)) {
      continue;
    }
    // The next token should be an inline token.
    let nextNextToken = tokens[i + 2];
    if (nextNextToken.type === TokenType.INLINE) {
      let text = nextNextToken.content;
      // Find the opening line.
      let match = beginShadeboxRe.exec(text);
      if (match) {
        let shadeboxTitleText = match[2] || "";
        // Replace the blockquote_open with a <div class="sp-wrapper"> opening.
        let wrapperToken = new Token("html_block", "", 0);
        wrapperToken.content = '<div class="sp-wrapper">';
        wrapperToken.type = "html_block";
        tokens.splice(i, 1, wrapperToken);
        // Replace the paragraph, inline, paragraph end and blockquote_close, with the title HTML div
        let titleToken = new Token("html_block", "", 0);
        titleToken.content = `<p><strong>${shadeboxTitleText}</strong></p>`;
        titleToken.type = "html_block";
        tokens.splice(i + 1, 4, titleToken);
      }
      // The end of the shaded box is also in a blockquote with the same structure
      // as the beginning, only with endMatch as the regex.
      let endMatch = endShadeboxRe.exec(text);
      if (endMatch) {
        // Replace everything between the blockquote_open and blockquote_close with a </div> closing.
        let endToken = new Token("html_block", "", 0);
        endToken.content = "</div>";
        endToken.type = "html_block";
        tokens.splice(i, 5, endToken);
      }
      // end if
    } // end for
  }
}
