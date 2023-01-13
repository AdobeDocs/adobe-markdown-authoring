"use strict";

import {
  addErrorContext,
  addWarningContext,
  ErrorContext,
  FilterParams,
  forEachLine,
  isInCodeBlock,
} from "../shared";

module.exports = {
  names: ["AM011", "link-spaces"],
  description: "Spaces between link components or in url",
  tags: ["warnings", "link"],
  function: function AM011(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    const codeBlockRe = new RegExp("```");
    var inCodeBlock = false;
    var isWarning = true;
    forEachLine(function forLine(line, lineIndex) {
      line = line.replace(/`{1}[^`].*?`{1}/, "CODE");
      const lineNumber = lineIndex + 1;
      const spaceinlink = line.match(/\[[^!]+\][\s]+\(/);
      const codeBlockMatch = codeBlockRe.exec(line);
      const spaceinurl = line.match(/\[[^!].*?\]\(\s+/);
      // console.log(line)
      inCodeBlock = isInCodeBlock(line, inCodeBlock);
      if (!inCodeBlock && (spaceinlink !== null || spaceinurl !== null)) {
        if (isWarning && spaceinurl === null) {
          addWarningContext(
            params.name,
            lineNumber + params.frontMatterLines.length,
            line,
            module.exports.names[0] +
              "/" +
              module.exports.names[1] +
              " " +
              module.exports.description
          );
        } else {
          addErrorContext(onError, lineNumber, line);
        }
      }
    });
  },
};
