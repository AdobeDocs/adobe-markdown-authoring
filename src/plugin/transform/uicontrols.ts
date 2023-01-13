import StateCore from 'markdown-it/lib/rules_core/state_core';
import Token from 'markdown-it/lib/token';
import { TokenType } from '..';

/**
 * UICONTROL (User Interface Control) transformation rule. Simply strips the [!UICONTROL <text>] markdown
 * and leaves the <text> part.
 * @param {} state
 */

export function transformUICONTROLs(state: StateCore) {
    let inlineTokens: Token[] = state.tokens.filter(
        (tok) => tok.type === TokenType.INLINE
    );
    const dnlRegex = /\[\!UICONTROL\s+([^\]]+)\]/;
    for (var i = 0, l = inlineTokens.length; i < l; i++) {
        // Check for all instances of dnlRegex and replace with the text
        // between the brackets.
        let text = inlineTokens[i].content;
        let match = dnlRegex.exec(text);
        while (match) {
            text = text.replace(match[0], match[1]);
            match = dnlRegex.exec(text);
        }
    }
}