"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  forEachLine,
  isInCodeBlock,
} from "../shared";

module.exports = {
  names: ["AM029", "git-merge-conflict-lines"],
  description: "Markdown source contains git merge conflict lines",
  tags: ["warnings", "git-merge-conflict"],
  function: function AM029(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    var inCodeBlock = false;
    forEachLine(function forLine(line, lineIndex) {
      line = line.replace(/`{1}[^`].*?`{1}/, "CODE");
      const lineNumber = lineIndex + 1;
      inCodeBlock = isInCodeBlock(line, inCodeBlock);
      if (!inCodeBlock) {
        if (line.startsWith("<<<<<<< HEAD")) {
          addErrorContext(onError, lineNumber, line);
        }
      }
    });
  },
};
