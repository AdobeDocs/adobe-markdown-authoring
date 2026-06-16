import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

/**
 * Transforms the meta tokens in the given state to add badge tokens.
 *
 * @param {StateCore} state - The state object containing the tokens.
 */
export function transformBadgeMeta(state: StateCore): void {
  // Get the tokens from the state
  const tokens: Token[] = state.tokens;

  // Regular expression to match the "badge" keyword
  const badgeRegex = /^badge/;

  // Regular expression to match key-value pairs within the badge parameters
  const paramRegex = /(\w+)=("[^"]+"|'[^']+'|\S+)/g;

  // Iterate over the tokens
  for (let i = 0, l = tokens.length; i < l; i++) {
    // Check if the current token is a front matter token
    if (tokens[i].type === TokenType.FRONT_MATTER) {
      const metaToken = tokens[i];

      // The front_matter token is produced by the host markdown engine, whose
      // shape for `token.meta` is not stable across VS Code versions:
      //   - VS Code <= 1.120: `token.meta` is the raw front matter string.
      //   - VS Code >= 1.121: `token.meta` is an object `{ content: string }`
      //     (the engine started wrapping the raw text in 1.121).
      // Reading it as a string unconditionally throws
      // "metaData.split is not a function" on 1.121+, which breaks the entire
      // markdown/parse and takes down the language service (issue #81).
      // Normalize both shapes to the raw string, and skip safely if neither
      // is present rather than throwing.
      const rawMeta: unknown = metaToken.meta;
      const metaData: string =
        typeof rawMeta === "string"
          ? rawMeta
          : rawMeta != null &&
            typeof (rawMeta as { content?: unknown }).content === "string"
          ? (rawMeta as { content: string }).content
          : "";

      // No usable front matter text — skip badge processing for this token.
      if (metaData === "") {
        continue;
      }

      // Split the meta data into lines
      const metaLines = metaData.split("\n");

      // Iterate over the lines
      for (const line of metaLines) {
        const keyValuePair = line.split(":");
        const key = keyValuePair[0].trim();

        // Check if the key matches the "badge" keyword
        if (key.match(badgeRegex)) {
          const params = keyValuePair[1].trim();
          let matches;
          let label = "";
          let type = "Informative";
          let url = "";
          let tooltip = "";

          // Iterate over the parameters
          while ((matches = paramRegex.exec(params)) !== null) {
            let paramName = matches[1];
            let paramValue = matches[2].replace(/['"]/g, "");

            // Assign the parameter values to the corresponding variables
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

          // Generate the HTML for the badge
          let badgeHTML = `<span class="sp-badge-wrapper"><sp-badge size="s" style="cursor:inherit !important" variant="${type.toLowerCase()}" dir="ltr"`;
          if (tooltip) {
            badgeHTML += ` title="${tooltip}"`;
          }
          if (type === "Caution") {
            badgeHTML +=
              " --mod-badge-background-color-default: var(--spectrum-yellow-background-color-default);" +
              " --mod-badge-label-icon-color-white: var(--spectrum-black);";
          }
          badgeHTML += `>${label}</sp-badge></span>`;

          // Add the badge HTML to the tokens list
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
