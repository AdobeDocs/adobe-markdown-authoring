"use strict";

import { addError, ErrorContext, FilterParams, filterTokens } from "../shared";
import { MarkdownItToken } from "markdownlint";

module.exports = {
  names: ["AM026", "table-indent"],
  description: "Table must use consistent indent level",
  tags: ["tables"],

  function: function am026(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    filterTokens(
      params,
      "table_open",
      function forToken(token: MarkdownItToken) {
        // remove whitespace and > if it's a note block
        var indent = token.line.replace(/^>/, "").search(/\S/);
        var beginWithFM = token.map[0] + params.frontMatterLines.length + 1;
        var endWithFM = token.map[1] + params.frontMatterLines.length;
        params.lines.forEach(function forLine(line, lineIndex) {
          // remove whitespace and > if it's a note block
          line = line.replace(/^>/, "");
          var lineIndexWithFM = lineIndex + params.frontMatterLines.length + 1;
          if (lineIndexWithFM >= beginWithFM && lineIndexWithFM <= endWithFM) {
            var lineIndent = line.search(/\S/);
            if (line !== "") {
              if (lineIndent !== indent) {
                addError(
                  onError,
                  lineIndex + 1,
                  "Expected indent " + indent + " found " + lineIndent,
                  line
                );
              }
            }
          }
        });
      }
    );
  },
};
