"use strict";

import {
  addError,
  ErrorContext,
  FilterParams,
  forEachHeading,
  rangeFromRegExp,
} from "../shared";
import { MarkdownItToken } from "markdownlint";

module.exports = {
  names: ["AM008", "header-contains-link"],
  description: "Heading contains link",
  tags: ["headings", "headers"],
  function: function AM008(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    const headingHasLinkRe = new RegExp("[^!]\\[.*\\]\\(.*\\)");
    forEachHeading(params, function forHeading(heading, content) {
      const match = headingHasLinkRe.exec(content);
      if (match) {
        addError(
          onError,
          heading.lineNumber,
          "Heading contains a link: '" + match[0] + "'",
          "",
          rangeFromRegExp(heading.line, headingHasLinkRe)
        );
      }
    });
  },
};
