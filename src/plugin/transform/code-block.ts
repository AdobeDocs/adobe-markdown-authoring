import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

export function transformCodeBlock(state: StateCore) {
    let tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      console.log(token);
    }
}