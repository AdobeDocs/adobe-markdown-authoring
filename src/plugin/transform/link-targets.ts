import StateCore from 'markdown-it/lib/rules_core/state_core';
import Token from 'markdown-it/lib/token';
import { TokenType } from '..';

export default function transformLinkTargets(state: StateCore) {
    let linkTokens: Token[] = state.tokens;
    const targetMatch = /\{\w*target\w*=\w*([^}]*)\}/;

    for (var i = 0, l = linkTokens.length; i < l; i++) {
        if (linkTokens[i].type === TokenType.INLINE) {
            const linkLine = linkTokens[i].content;
            if (linkLine) {
                const ids = linkLine.match(targetMatch);
                if (ids && ids[1]) {
                    linkTokens[i].attrSet('target', ids[1]);
                    linkTokens[i].content = linkLine.replace(ids[0], '');
                }
            }
        }
    }
}
