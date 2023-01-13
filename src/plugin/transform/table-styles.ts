import StateCore from 'markdown-it/lib/rules_core/state_core';
import Token from 'markdown-it/lib/token';
import { TokenType } from '..';

/**
 * Ignore the {style="table-layout:fixed"} attribute after a table.
 */
export function transformTableStyles(state: StateCore) {
    let inlineTokens: Token[] = state.tokens.filter(
        (tok) => tok.type === TokenType.INLINE
    );
    const styleRegEx = /\{style[^\}]*\}/;
    for (var i = 0, l = inlineTokens.length; i < l; i++) {
        // Remove the matching style directive from the token list.
        let text = inlineTokens[i].content;
        let match = styleRegEx.exec(text);
        if (match) {
            inlineTokens[i].content = text.replace(match[0], '');
        }
    }
}