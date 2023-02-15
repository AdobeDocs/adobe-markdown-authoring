"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  filterTokens,
} from "../shared";
import { MarkdownItToken } from "markdownlint";

module.exports = {
  names: ["AM017", "text-following-id-tag-heading"],
  description: "No text or images after header ID Tags ({#id-tag-name}",
  tags: ["headings", "headers"],
  function: function AM017(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    let prevLevel = 0;
    filterTokens(
      params,
      "heading_open",
      function forToken(token: MarkdownItToken) {
        var line = token.line
          .replace(/`.*?`/, "code")
          .replace(/{{.*?}}/, "SNIPPET");
        // strip images before check
        line = line.replace(/!\[.*?\]\((.*?)\)([\s]*\{(.*?)\})?/, "");
        if (line.match(/^[#]+.*?{/gm)) {
          if (line.match(/^[#]+.*?{[#].*?}[\s]*$/gm)) {
            // console.log('GOOD:' + token.line + ' ' + line)
          } else {
            // console.log('BAD: ' + token.line + ' ' + line)
            addErrorContext(onError, token.lineNumber, token.line);
          }
        }
      }
    );
  },
};
