import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "../index";

/**
 * Here is what the output should look like:
 *
 <sp-tabs selected="1">
  <sp-tab label="Tab 1" value="1"></sp-tab> <sp-tab value="2">Tab 2</sp-tab>
  <sp-tab label="Tab 3" value="3">
    <sp-icon-checkmark slot="icon"></sp-icon-checkmark>
  </sp-tab>
  <sp-tab vertical value="4">
    Tab 4 <sp-icon-checkmark slot="icon"></sp-icon-checkmark>
  </sp-tab>
  <sp-tab-panel value="1">
    Content for Tab 1 which uses an attribute for its content delivery
  </sp-tab-panel>
  <sp-tab-panel value="2">
    Content for Tab 2 which uses its text content directly
  </sp-tab-panel>
  <sp-tab-panel value="3">
    Content for Tab 3 which uses an attribute with a
    <code>[slot="icon"]</code> child
  </sp-tab-panel>
  <sp-tab-panel value="4">
    Content for Tab 4 which uses both its text content and a
    <code>[slot="icon"]</code> child displayed using the
    <code>[vertical]</code> attribute to define their alignment
  </sp-tab-panel></sp-tabs
>

 * @param state
 */

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
        let inlineText = nextNextToken.content;
        // Find the opening line.
        let match = tabRe.exec(inlineText);
        if (match) {
          // Replace all of the tokens that make up the opening [!BEGINTABS] paragraph with a single html_block token.
          let newToken = new Token(TokenType.HTML_BLOCK, "", 1);
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
        } else {
          continue; // Need this to skip irrelevant blockquotes.
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
      let inlineText = inlineToken.content;
      let match = tabTitleRe.exec(inlineText);
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
        match = endTabsRe.exec(inlineText);
        if (match) {
          // We have the [!ENDTABS] line.
          // Tokens i through i+5 are the blockquote open, paragraph open, inline, paragraph close, and blockquote close
          // for the [!ENDTABS] line.  Remove them and replace them with a signle HTML_BLOCK token that closes the tabs.
          let closeToken = new Token(TokenType.HTML_BLOCK, "", 0);
          closeToken.content = "</sp-tabs></div>";
          tokens.splice(i, 5, closeToken);
          // Generate the tabHeader HTML tokens and insert them before the first tab content.
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
