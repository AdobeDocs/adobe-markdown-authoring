import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
import { TokenType } from "..";

/**
 * Transforms the inline tokens in the given state to add badge tokens.
 *
 * @param {StateCore} state - The state object containing the tokens.
 */
export function transformBadgeInline(state: StateCore): void {
  // Get the tokens from the state
  let tokens: Token[] = state.tokens;

  // Regular expression to match the badge inline tokens
  const badgeRegex = /\[\!BADGE\s(.+?)\](?:\{(.+?)\})?/g;

  // Iterate over the tokens
  for (let i = 0, l = tokens.length; i < l; i++) {
    // Check if the current token is an inline token
    if (tokens[i].type === TokenType.INLINE) {
      // Get the content of the token
      let content = tokens[i].content;

      // Find all the badge inline tokens in the content
      let matches = Array.from(content.matchAll(badgeRegex));

      // Iterate over the badge inline tokens
      matches.forEach((match) => {
        // Extract the label and parameters from the match
        let label = match[1];
        let params = match[2];

        // Default values for type, url, and tooltip
        let type = "Informative";
        let url = "";
        let tooltip = "";

        // Check if params exist before processing them
        if (params) {
          // Split the parameters into key-value pairs
          params.split(/\s+/).forEach((param) => {
            let [key, value] = param.split("=");

            // Assign the parameter values to the corresponding variables
            if (key === "type") {
              // Remove quotes around the type parameter
              type = value.replace(/['"]/g, "");
            } else if (key === "url") {
              // Remove quotes around the url parameter
              url = value.slice(1, -1);
            } else if (key === "tooltip") {
              // Remove quotes around the tooltip parameter
              tooltip = value.replace(/['"]/g, "");
            }
          });
        }

        // Generate the badge HTML
        let badgeHTML = `<span class="sp-badge-wrapper"><sp-badge size="s" variant="${type.toLowerCase()}" dir="ltr"`;
        if (tooltip) {
          badgeHTML += ` title="${tooltip}"`;
        }
        let style = ' style="cursor:inherit !important;';
        if (type === "Caution") {
          style +=
            " --mod-badge-background-color-default: var(--spectrum-yellow-background-color-default);" +
            " --mod-badge-label-icon-color-white: var(--spectrum-black);";
        }
        badgeHTML += `${style}">${label}</sp-badge></span>`;

        // Add the badge HTML to the content
        content = content.replace(match[0], badgeHTML);
      });

      // Update the content of the token
      tokens[i].content = content;
    }
  }
}
