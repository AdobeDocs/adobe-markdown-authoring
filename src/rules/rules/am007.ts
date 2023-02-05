"use strict";

import {
  addError,
  ErrorContext,
  FilterParams,
  forEachHeading,
  rangeFromRegExp,
} from "../shared";

module.exports = {
  names: ["AM007", "header-anchor-without-hash"],
  description: "Heading anchor has no hash",
  tags: ["headings", "headers"],
  function: function AM007(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    const anchorMissingHashRe = new RegExp("{[^#][^=]*}$");
    forEachHeading(params, function forHeading(heading, content) {
      content = content.replace(/{{.*?}}/, "SNIPPET");
      const match = anchorMissingHashRe.exec(content);
      if (match) {
        // console.log(content)
        addError(
          onError,
          heading.lineNumber,
          "Anchor without #: '" + match[0] + "'",
          "",
          rangeFromRegExp(heading.line, anchorMissingHashRe)
        );
      }
    });
  },
};
