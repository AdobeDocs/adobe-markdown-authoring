"use strict";

import { addError, ErrorContext, FilterParams, filterTokens } from "../shared";
import { MarkdownItToken } from "markdownlint";

module.exports = {
  names: ["AM023", "missing-table-pipes"],
  description: "Table must use outer pipes",
  tags: ["tables"],

  function: function AM023(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    filterTokens(
      params,
      "table_open",
      function forToken(token: MarkdownItToken) {
        // remove whitespace and > if it's a note block
        var line = token.line.trim().replace(/^>/, "").trim();
        if (!line.startsWith("|")) {
          var lineNumber = token.lineNumber; // + params.frontMatterLines.length;
          // console.log(token, params.frontMatterLines.length)
          addError(onError, lineNumber, "Missing Table pipes", line);
        }
      }
    );
  },
};
