import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

export function transformImages(state: StateCore) {
  let tokens: Token[] = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token) {
      console.log(token);
    }
  }
}
