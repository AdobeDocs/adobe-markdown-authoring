import MarkdownIt from "markdown-it";
import { TokenType } from "..";
import StateCore from "markdown-it/lib/rules_core/state_core";

export function transformSingleNewline(state: StateCore): void {
  let tokens = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === TokenType.INLINE) {
      let content = tokens[i].content;
      tokens[i].content = content.replace(/\n(?!\n)/g, "<br/>");
    }
  }
}
