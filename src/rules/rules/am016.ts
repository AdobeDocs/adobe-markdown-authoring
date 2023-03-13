"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  forEachLine,
  isInCodeBlock,
  makeTokenCache,
} from "../shared";

module.exports = {
  names: ["AM016", "mismatched-brackets-backticks"],
  description: "Unmatched brackets, parens, braces or backticks",
  tags: ["code", "indent_level"],
  function: function AM016(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    makeTokenCache(params);
    const lines = params.lines;
    var inCodeBlock = false;
    var pre = "";
    forEachLine(function forLine(line, i) {
      var prevInCodeBlock = inCodeBlock;
      inCodeBlock = isInCodeBlock(line, inCodeBlock);
      if (inCodeBlock || prevInCodeBlock) {
        // } || (line.match(/.*?```/) || []).length > 0) {
        pre = ">";
      } else {
        pre = "   ";
      }

      if (!inCodeBlock) {
        var oldline = line;
        line = oldline.replace(/```.*?```/g, " <code3> ");
        line = line.replace(/^[\s]*[>]*[\s]*```/, "<fence>");
        line = line.replace(/``.*?``/g, " <code2> ");
        line = line.replace(/`.*?`/g, " <code1> ");
        line = line.replace(/\\`/g, "&grave");

        var opensquares = (line.match(/\[/g) || []).length;
        var clossquares = (line.match(/\]/g) || []).length;
        var openfrench = (line.match(/\{/g) || []).length;
        var closfrench = (line.match(/\}/g) || []).length;
        var backticks = (line.match(/\`/g) || []).length;

        if (backticks % 2 !== 0) {
          //unclosed backtick/inline code block -- odd number of backticks
          addErrorContext(onError, i + 1, lines[i].trim());
        }

        if (opensquares !== clossquares) {
          addErrorContext(onError, i + 1, lines[i].trim());
        }

        if (openfrench !== closfrench) {
          addErrorContext(onError, i + 1, lines[i].trim());
        }
      }
    });
  },
};
