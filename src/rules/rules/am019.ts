"use strict";

import {
  addError,
  ErrorContext,
  FilterParams,
  forEachLine,
  makeTokenCache,
} from "../shared";

module.exports = {
  names: ["AM019", "link-syntax"],
  description: "Malformed link",
  tags: ["link"],
  function: function AM019(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    makeTokenCache(params);
    const codeBlockRe = new RegExp("```");
    var inCodeBlock = false;
    forEachLine(function forLine(line, lineIndex) {
      const lineNumber = lineIndex + 1;
      const codeBlockMatch = codeBlockRe.exec(line);
      const spaceinurl = line.match(/\[.+?\]\((?:.*\s+.*)\)/);
      const pareninurl = line.match(
        /\[[^\]]*\]\((?=.*?\()(?:[^\s)]|\((?:[^()]*|\([^()]*\))*\))+\)/
      );
      if (codeBlockMatch) {
        inCodeBlock = !inCodeBlock;
      }
      if (!inCodeBlock && spaceinurl !== null) {
        addError(onError, lineNumber, "Space in link target URL", line, null);
      }

      if (!inCodeBlock && pareninurl !== null) {
        addError(onError, lineNumber, "Paren in link target URL", line, null);
      }
    });
  },
};
