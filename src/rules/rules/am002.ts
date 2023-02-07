"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  filterTokens,
} from "../shared";
import { MarkdownItToken } from "markdownlint";

module.exports = {
  names: ["AM002", "id-tag-has-spaces"],
  description: "ID Tags ({#id-tag-name} cannot contain spaces",
  tags: ["headings", "headers"],
  function: function AM002(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    filterTokens(
      params,
      "heading_open",
      function forToken(token: MarkdownItToken) {
        var heading_title = token.line.replace(/^[#]+ /g, "");
        if (heading_title.match(/.*{#.*[ ].*}/)) {
          addErrorContext(onError, token.lineNumber, token.line);
        }
      }
    );
  },
};
