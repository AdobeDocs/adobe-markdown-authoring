"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  forEachLine,
  makeTokenCache,
} from "../shared";

module.exports = {
  names: ["AM005", "anchor-id-starts-with-number"],
  description: "Anchor ids {#..} must begin with letter",
  tags: ["anchors", "anchors"],
  function: function AM005(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    makeTokenCache(params);
    const codeBlockRe = new RegExp("```");
    var inCodeBlock = false;
    const idStartsWithNumberRe = new RegExp(".*?{#d+.*?}");
    forEachLine(function forLine(line, lineIndex) {
      const lineNumber = lineIndex + 1;
      const codeBlockMatch = codeBlockRe.exec(line);

      if (codeBlockMatch) {
        inCodeBlock = !inCodeBlock;
      }
      if (!inCodeBlock && line.match(/.*?{#\d+.*?}/)) {
        addErrorContext(onError, lineNumber, line);
      }
    });
  },
};
