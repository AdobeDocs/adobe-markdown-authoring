"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  forEachLine,
  makeTokenCache,
} from "../shared";

module.exports = {
  names: ["AM013", "code-block-fence-too-many-ticks"],
  description: "Code blocks should have only three ticks",
  tags: ["code", "indent_level"],
  function: function AM013(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    makeTokenCache(params);
    const lines = params.lines;
    forEachLine(function forLine(line, i) {
      line = line.replace(">", " "); // get rid of blockquotes
      line = line.replace(/```.*?```/, "reg");
      if (line.search("````") >= 0) {
        addErrorContext(onError, i + 1, lines[i].trim());
      }
    });
  },
};
