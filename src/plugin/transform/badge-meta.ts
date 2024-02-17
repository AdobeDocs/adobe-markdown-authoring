import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "../index";

export function transformBadgeMeta(state: StateCore): void {
  const tokens: Token[] = state.tokens;
  const badgeRegex = /^badge/;
  const paramRegex = /(\w+)=("[^"]+"|'[^']+'|\S+)/g;

  for (let i = 0, l = tokens.length; i < l; i++) {
    if (tokens[i].type === TokenType.FRONT_MATTER) {
      const metaToken = tokens[i];
      const metaData = metaToken.meta;

      const metaLines = metaData.split("\n");
      for (const line of metaLines) {
        const keyValuePair = line.split(":");
        const key = keyValuePair[0].trim();

        if (key.match(badgeRegex)) {
          const params = keyValuePair[1].trim();
          let matches;
          let label = "";
          let type = "Informative";
          let url = "";
          let tooltip = "";

          while ((matches = paramRegex.exec(params)) !== null) {
            let paramName = matches[1];
            let paramValue = matches[2].replace(/['"]/g, "");

            if (paramName === "label") {
              label = paramValue;
            } else if (paramName === "type") {
              type = paramValue;
            } else if (paramName === "url") {
              url = paramValue;
            } else if (paramName === "tooltip") {
              tooltip = paramValue;
            }
          }

          let badgeHTML = `<span class="sp-badge-wrapper"><sp-badge size="s" style="cursor:inherit !important" variant="${type.toLowerCase()}" dir="ltr"`;
          if (tooltip) {
            badgeHTML += ` title="${tooltip}"`;
          }
          badgeHTML += `>${label}</sp-badge></span>`;

          if (url) {
            badgeHTML = `<a href="${url}" style="color:inherit !important;text-decoration:none">${badgeHTML}</a>`;
          }

          const badgeToken = new Token("html_inline", "", 0);
          badgeToken.content = badgeHTML;
          tokens.splice(i + 1, 0, badgeToken);
          i++;
          l++;
        }
      }
    }
  }
}
