"use strict";

import {
  addErrorContext,
  addErrorDetailIf,
  ErrorContext,
  FilterParams,
  forEachLine,
  isInCodeBlock,
} from "../shared";

module.exports = {
  names: ["AM015", "malformed-html-comment"],
  description: "HTML comment malformed",
  tags: ["html", "comment"],
  function: function AM015(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    const lines = params.lines;
    var inCodeBlock = false;
    var htmlOpen = -1;

    forEachLine(function forLine(line, i) {
      line = line.replace(/`[^`].*`/, "");

      inCodeBlock = isInCodeBlock(line, inCodeBlock);

      if (!inCodeBlock && line.search(/<![-]*[>]+/) >= 0) {
        addErrorContext(onError, i + 1, lines[i].trim());
      }
    });
    forEachLine(function forLine(line, i) {
      line = line.replace(/`[^`].*`/, "");
      inCodeBlock = isInCodeBlock(line, inCodeBlock);

      if (!inCodeBlock) {
        if (line.search(/<![-][-]*/) >= 0) {
          // open comment
          htmlOpen = i + 1; // i+1+fmlen
        }
        if (line.search(/[-][-]*>/) >= 0) {
          htmlOpen = -1;
        }
      }
    });
    if (htmlOpen !== -1) {
      addErrorDetailIf(onError, htmlOpen, "", "Unclosed HTML comment", null);
    }
  },
};
