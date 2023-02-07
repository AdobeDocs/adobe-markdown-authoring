"use strict";
import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  filterTokens,
} from "../shared";

module.exports = {
  names: ["AM001", "heading-title-starts-with-numbers"],
  description: "Headings cannot contain numbers without named anchor {#..}",
  tags: ["headings", "headers"],
  function: function AM001(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    filterTokens(params, "heading_open", function forToken(token) {
      var heading_title = token.line.replace(/.*?[#]+ /g, "");

      if (heading_title.match(/.*?\d+/) && !heading_title.match(/\{\#.*?\}$/)) {
        addErrorContext(onError, token.lineNumber, token.line);
      }
    });
  },
};
