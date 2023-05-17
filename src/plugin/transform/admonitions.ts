import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

/**
 * Admonition Transformation Rule
 *
 * Admonition Markup
 * .
 * >[!NOTE]
 * >
 * >This is note text.
 * .
 * <div class="extension note">
 * <div>NOTE</div>
 * <div>
 * <p>This is a standard NOTE block.</p>
 * </div>
 * </div>
 * .
 *
 *
 * @return {void}
 */

export function transformAdmonitions(state: StateCore): void {
  let tokens: Token[] = state.tokens;
  let startBlock: number = -1;
  let level: number = 0;
  let label: string = "NOTE";

  for (var i: number = 0, l: number = tokens.length; i < l; i++) {
    // Is this the start of a blockquote?  If so, set the starting index and increment
    // the level.
    if (tokens[i].type === TokenType.BLOCKQUOTE_OPEN) {
      level += 1;
      startBlock = i;
    }

    // Are we inside a block quote? If not, then just go to the next token.
    if (level === 0) {
      // We're not in a block quote context. Skip tokens until we are.
      continue;
    }

    // Are we at the end of the block?  If so, then decrement the level and pair the
    // token with the start token.
    if (tokens[i].type === TokenType.BLOCKQUOTE_CLOSE) {
      level -= 1;
      // tokens[i].type = tokens[startBlock].type;
      tokens[i].tag = tokens[startBlock].tag; // If this is an ExlTag;
      continue;
    }
    // We are inside an ExL block because level > 0.
    // <div class="extension note">
    // <div>NOTE</div>
    // <div>
    // <p>This is a standard NOTE block.</p>
    // </div>
    // </div>
    if (tokens[i].type === TokenType.PARAGRAPH_OPEN) {
      tokens[i].tag = "div";
      tokens[i].attrSet("class", "ico");
      tokens[i].content = label;
      // const labelToken = new Token(TokenType.INLINE, "", 0);
      // labelToken.content = label;
      // labelToken.level = 2;
      // tokens.splice(i + 1, 0, labelToken);
      // i++;
      continue;
    } else if (tokens[i].type === TokenType.PARAGRAPH_CLOSE) {
      tokens[i].tag = "div";
      continue;
    }
    // The next token after the paragraph open will be the label of the note type that could
    // be one of the various admonition types.  If it's not, then this is an
    // ordinary block, so stop processing.
    if (tokens[i].type === TokenType.INLINE) {
      let labelMatches = tokens[i].content.match(
        // eslint-disable-next-line max-len
        /^\[\!(ADMINISTRATION|AVAILABILITY|CAUTION|ERROR|IMPORTANT|INFO|MORELIKETHIS|NOTE|PREREQUISITES|SUCCESS|TIP|WARNING)\](\n\s*)*(.*)/
      );
      if (labelMatches) {
        tokens[i].content = labelMatches[3]; // Clear the [!NOTE] label text, retaining the message.
        label = labelMatches[1].toUpperCase();
        let labelText =
          labelMatches[1] === "MORELIKETHIS"
            ? "Related Articles"
            : labelMatches[1] || "extension";
        tokens[startBlock].tag = "div";
        tokens[startBlock].attrSet(
          "class",
          `extension ${labelMatches[1].toLowerCase()}`
        );
      } else {
        let videoMatches = tokens[i].content.match(/^\[\!VIDEO\]\s*\((.*)\)/);

        if (videoMatches) {
          let url = videoMatches[1];
          tokens[startBlock].tag = "div";
          tokens[startBlock].attrSet("class", "extension video");
          tokens[i - 1].tag = "video";
          tokens[i - 1].attrSet("allowfullscreen", "true");
          tokens[i - 1].attrSet("controls", "true");
          tokens[i - 1].attrSet("height", "250");
          tokens[i - 1].attrSet("poster", "/assets/img/video_slug.png");
          tokens[i - 1].attrSet("crossorigin", "anonymous");
          tokens[i - 1].attrSet("src", url);
          tokens[i].content = "";
          tokens[i + 1].tag = "video";
          // Increment the counter to skip the closing tag we just made.
          i += 1;
        }
      }
    }
  }
}
