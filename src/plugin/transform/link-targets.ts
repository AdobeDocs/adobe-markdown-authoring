import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

// Check if a token has special elements (images, code) near link tokens
function isNearSpecialElement(token: Token): boolean {
  if (!token.children) return false;

  // Check if there are image or code tokens near link tokens
  for (let i = 0; i < token.children.length; i++) {
    if (token.children[i].type === "link_open") {
      // Check nearby tokens (within 3 positions) for images or code
      const start = Math.max(0, i - 3);
      const end = Math.min(token.children.length, i + 3);

      for (let j = start; j < end; j++) {
        if (
          j !== i &&
          (token.children[j].type === "image" ||
            token.children[j].type === "code_inline")
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

export default function transformLinkTargets(state: StateCore) {
  let tokens: Token[] = state.tokens;
  // More specific regex that won't interfere with other elements
  const targetMatch =
    /(?<![`*_~])\[([^\]]+)\]\(([^)]+)\)\{\s*target\s*=\s*["']?([^"'\s\}]+)["']?\s*\}/g;

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token.type === TokenType.INLINE && token.children) {
      // Process each child token instead of replacing the entire inline token
      let modified = false;

      // First pass: identify if we need to modify this token
      if (token.content.match(targetMatch)) {
        // Create a new array for modified children
        const newChildren: Token[] = [];

        // Track the current position in the content
        let lastIndex = 0;
        let content = token.content;
        let match;

        // Reset regex state
        targetMatch.lastIndex = 0;

        // Process each match
        while ((match = targetMatch.exec(content)) !== null) {
          const [fullMatch, text, url, target] = match;
          const matchIndex = match.index;

          // Add text before the match
          if (matchIndex > lastIndex) {
            const beforeText = content.slice(lastIndex, matchIndex);
            if (beforeText) {
              const textToken = new Token("text", "", 0);
              textToken.content = beforeText;
              newChildren.push(textToken);
            }
          }

          // Add the link tokens
          const linkOpenToken = new Token("link_open", "a", 1);
          linkOpenToken.attrs = [
            ["href", url],
            ["target", target],
          ];

          const textToken = new Token("text", "", 0);
          textToken.content = text;

          const linkCloseToken = new Token("link_close", "a", -1);

          newChildren.push(linkOpenToken, textToken, linkCloseToken);

          // Update lastIndex
          lastIndex = matchIndex + fullMatch.length;
        }

        // Add any remaining text
        if (lastIndex < content.length) {
          const afterText = content.slice(lastIndex);
          if (afterText) {
            const textToken = new Token("text", "", 0);
            textToken.content = afterText;
            newChildren.push(textToken);
          }
        }

        // Replace children with our new array
        token.children = newChildren;

        // Update the token's content to match its children
        token.content = newChildren.map((t) => t.content || "").join("");

        modified = true;
      }

      // Skip ahead if we modified this token to avoid processing it again
      if (modified) {
        continue;
      }
    }
  }
}
