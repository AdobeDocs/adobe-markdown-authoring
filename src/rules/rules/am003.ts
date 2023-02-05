"use strict";

import { MarkdownItToken } from "markdownlint";
import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  filterTokens,
} from "../shared";

module.exports = {
  names: ["AM003", "hr not supported"],
  description: "Horizontal rules are not supported",
  tags: ["hr"],
  function: function AM003(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    filterTokens(params, "hr", function forToken(token: MarkdownItToken) {
      addErrorContext(onError, token.lineNumber, token.line);
    });
  },
};
