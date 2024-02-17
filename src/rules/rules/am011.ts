"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  filterTokens,
} from "../shared";

import { MarkdownItToken } from "markdownlint";

module.exports = {
  names: ["AM011", "link-spaces"],
  description: "Spaces between link components or in url",
  tags: ["warnings", "link"],
  function: function AM011(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    filterTokens(params, "inline", (token: MarkdownItToken) => {
      const line = token.line;
      const spaceinlink = line.match(/\[[^\]]+\]\s+\([^)]*[^)]*\)/);
      const spaceinurl = line.match(/\[[^\]]*\]\((?:[^)]*\s+[^)]*)\)/);
      if (spaceinlink !== null || spaceinurl !== null) {
        addErrorContext(onError, token.lineNumber, token.line);
      }
    });
  },
};
