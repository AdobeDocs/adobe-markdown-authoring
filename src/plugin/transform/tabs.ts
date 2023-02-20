import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

export default function transformTabs(state: StateCore) {
  let tokens: Token[] = state.tokens;
  let tabRe = /\[!BEGINTABS\]/;
  let tabsGoHere = 0;
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token.type !== TokenType.BLOCKQUOTE_OPEN) {
      continue;
    } else {
      // We are in a Blockquote. The next token should be a paragraph.
      let nextToken = tokens[i + 1];
      if (nextToken.type !== TokenType.PARAGRAPH_OPEN) {
        continue;
      }
      // The next token should be an inline token.
      let nextNextToken = tokens[i + 2];
      if (nextNextToken.type === TokenType.INLINE) {
        let text = nextNextToken.content;
        // Find the opening line.
        let match = tabRe.exec(text);
        if (match) {
          // Replace all of the tokens that make up the opening [!BEGINTABS] line with a single html_block token.
          let newToken = new Token(TokenType.HTML_BLOCK, "", 0);
          newToken.content = `<div class="sp-wrapper"><sp-tabs
                    selected="1"
                    size="l"
                    direction="horizontal"
                    dir="ltr"
                    focusable=""
                  >`;
          tokens.splice(i, 5, newToken);
          i++;
          tabsGoHere = i;
        }
      }
    }
    // Find the next blockquote_open that has a paragraph_open and an inline token with a [!TAB ...] line, or
    // an [!ENDTABS] line.
    let tabTitleRe = /\[!TAB\s+(.*)\]/;
    let endTabsRe = /\[!ENDTABS\]/;
    let tabTitle = "";
    let tabTitles = [];
    let tabCount = 0;

    while (i < tokens.length) {
      let nextToken = tokens[i];
      // Sklp over any tokens that are not blockquote_open
      if (nextToken.type !== TokenType.BLOCKQUOTE_OPEN) {
        i++;
        continue;
      }
      // The next token better be a paragraph_open.
      let paraToken = tokens[i + 1];
      if (paraToken.type !== TokenType.PARAGRAPH_OPEN) {
        i++;
        continue;
      }
      // The next token better be an inline token.
      let inlineToken = tokens[i + 2];
      if (inlineToken.type !== TokenType.INLINE) {
        i++;
        continue;
      }
      // We have a blockquote_open, paragraph_open, and inline token.  Look for a [!TAB ...] line or an [!ENDTABS]
      // line.
      let text = inlineToken.content;
      let match = tabTitleRe.exec(text);
      if (match) {
        // We have a [!TAB ...] line.  Save the tab title and the tab content.
        tabTitle = match[1];
        tabTitles.push(tabTitle);
        // tabId = tabIdPrefix + tabCount;
        tabCount++;
        let spTabPanelStart = `<sp-tab-panel
    value="${tabCount}"
    dir="ltr"
    slot="tab-panel"
    role="tabpanel"
    tabindex="-1"
    id="sp-tab-panel-${tabCount - 1}"
    aria-labelledby="sp-tab-${tabCount - 1}"
    aria-hidden="true"><div style="display:block !important">`;
        let newToken = new Token(TokenType.HTML_BLOCK, "", 0);
        newToken.content = spTabPanelStart;
        tokens.splice(i, 5, newToken);
        i++;
        // Everything up to the next blockquote_open is the tab content.  Leave it alone.
        // Find the next blockquote_open.
        while (i < tokens.length) {
          nextToken = tokens[i];
          if (nextToken.type === TokenType.BLOCKQUOTE_OPEN) {
            // Insert the </sp-tab-panel> closing.
            let spTabPanelEnd = "</div></sp-tab-panel>";
            let newToken = new Token(TokenType.HTML_BLOCK, "", 0);
            newToken.content = spTabPanelEnd;
            tokens.splice(i, 0, newToken);
            break;
          }
          i++;
        }
      } else {
        // We don't have a [!TAB ...] line.  Look for an [!ENDTABS] line.
        match = endTabsRe.exec(text);
        if (match) {
          // We have the [!ENDTABS] line.  Replace it with the closing </div> tag.
          inlineToken.content = "</sp-tabs></div>";
          inlineToken.type = TokenType.HTML_BLOCK;
          // Remove the paragraph_open and paragraph_close tokens.
          tokens.splice(i + 1, 2);
          // Remove the blockquote_open token.
          tokens.splice(i, 1);
          const tabHeaders = tabTitles.map((tabLab, index) => {
            const tabContent = `<sp-tab
                        label="${tabLab}"
                        value="${index + 1}"
                        dir="ltr"
                        role="tab"
                        id="sp-tab-${index + 1}"
                        aria-selected="true"
                        tabindex="-1"
                        aria-controls="sp-tab-panel-${index + 1}"
                        selected=""
                      ></sp-tab>`;
            let newToken = new Token(TokenType.HTML_BLOCK, "", 0);
            newToken.content = tabContent;
            return newToken;
          });
          tokens.splice(tabsGoHere, 0, ...tabHeaders);
          break;
        }
      }
      i++;
    }
  }
}
