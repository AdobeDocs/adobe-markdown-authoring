import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  filterTokens,
} from "../shared";

/**
 * Headings cannot contain numbers without named anchor {#..}
 */
function AM001(
  params: FilterParams,
  onError: (context: ErrorContext) => void
): void {
  filterTokens(params, "heading_open", function forToken(token) {
    const heading_title = token.line.replace(/.*?[#]+ /g, "");

    if (heading_title.match(/.*?\d+/) && !heading_title.match(/\{\#.*?\}$/)) {
      addErrorContext(onError, token.lineNumber, token.line);
    }
  });
}

module.exports = {
  names: ["AM001", "heading-title-starts-with-numbers"],
  description: "Headings cannot contain numbers without named anchor {#..}",
  tags: ["headings", "headers"],
  function: AM001,
};
