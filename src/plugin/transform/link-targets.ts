import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

export default function transformLinkTargets(state: StateCore) {
  let tokens: Token[] = state.tokens;
  const targetMatch =
    /(?:^|\s)(\[([^\]]*)\]\(([^\)]*)\)\{\s*target\s*=\s*([^\}]*)\})/; // [text](url){target=foo}

  for (var i = 0, l = tokens.length; i < l; i++) {
    let token = tokens[i];
    if (token.type === TokenType.INLINE && token.content.match(targetMatch)) {
      const linkLine = tokens[i].content;
      if (linkLine) {
        const ids = linkLine.match(targetMatch);
        const [_, fullMatch, text, url, target] = ids || [];

        const linkToken = new Token("link_open", "a", 1);
        linkToken.attrs = [
          ["href", url],
          ["target", target],
        ];
        linkToken.content = text;

        const textToken = new Token("text", "", 0);
        textToken.content = text;

        const linkCloseToken = new Token("link_close", "a", -1);

        const beforeText = linkLine.slice(0, linkLine.indexOf(fullMatch));
        const afterText = linkLine.slice(
          linkLine.indexOf(fullMatch) + fullMatch.length
        );

        const newTokens = [
          new Token("text", "", 0),
          linkToken,
          textToken,
          linkCloseToken,
          new Token("text", "", 0),
        ];

        newTokens[0].content = beforeText;
        newTokens[4].content = afterText;

        tokens.splice(i, 1, ...newTokens);
      }
    }
  }
}
