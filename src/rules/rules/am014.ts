"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  forEachLine,
  makeTokenCache,
} from "../shared";

module.exports = {
  names: ["AM014", "code-block-language-has-curly-braces"],
  description: "Language identifier for code-blocks should not contain braces",
  tags: ["code", "indent_level"],
  function: function AM014(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    makeTokenCache(params);
    forEachLine(function forLine(line, i) {
      line = line.replace(">", " "); // get rid of blockquotes
      line = line.replace(/```.*?```/g, "reg"); // Ignore inline code blocks
      if (line.match(/```.*\{/)) {
        addErrorContext(onError, i + 1, line.trim());
      }
    });
  },
};
