import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

export function transformBadgeInline(state: StateCore): void {
  let tokens: Token[] = state.tokens;
  const badgeRegex = /\[\!BADGE\s(.+?)\](?:\{(.+?)\})?/g; // Updated regex to include optional badge parameters

  for (let i = 0, l = tokens.length; i < l; i++) {
    if (tokens[i].type === TokenType.INLINE) {
      let content = tokens[i].content;
      let matches = Array.from(content.matchAll(badgeRegex));

      matches.forEach((match) => {
        let label = match[1];
        let params = match[2];
        let type = "Informative";
        let url = "";
        let tooltip = "";

        // Check if params exist before processing them
        if (params) {
          params.split(/\s+/).forEach((param) => {
            let [key, value] = param.split("=");
            if (key === "type") {
              type = value;
            } else if (key === "url") {
              url = value.slice(1, -1);
            } else if (key === "tooltip") {
              tooltip = value.slice(1, -1);
            }
          });
        }

        let badgeHTML = `<span class="sp-badge-wrapper"><sp-badge size="s" style="cursor:inherit !important" variant="${type.toLowerCase()}" dir="ltr"`;
        if (tooltip) {
          badgeHTML += ` title="${tooltip}"`;
        }
        badgeHTML += `>${label}</sp-badge></span>`;

        if (url) {
          badgeHTML = `<a href="${url}" style="color:inherit !important;text-decoration:none">${badgeHTML}</a>`;
        }

        content = content.replace(match[0], badgeHTML);
      });

      tokens[i].content = content;
    }
  }
}
