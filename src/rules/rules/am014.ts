"use strict";

import { ErrorContext, FilterParams, forEachLine } from "../shared";

module.exports = {
  names: ["AM014", "code-block-language-has-curly-braces"],
  description: "Language identifier for code-blocks should not contain braces",
  tags: ["code", "indent_level"],
  function: function AM014(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    forEachLine(function forLine(line, i) {
      line = line.replace(">", " "); // get rid of blockquotes
      line = line.replace(/```.*?```/g, "reg");
    });
  },
};
