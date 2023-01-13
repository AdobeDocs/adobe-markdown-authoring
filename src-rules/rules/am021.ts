"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  filterTokens,
} from "../shared";
import { MarkdownItToken } from "markdownlint";

module.exports = {
  names: ["AM021", "youtube-video"],
  description: "YouTube videos are not supported",
  tags: ["adobe-markdown", "adobe-markdown"],
  function: function AM021(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    filterTokens(
      params,
      "blockquote_open",
      function forToken(token: MarkdownItToken) {
        var line = token.line;
        if (token.line.indexOf("[!") > 0) {
          // is it AFM component
          // TODO: split the tag out here
          if (token.line.indexOf("[!VIDEO]") > 0) {
            // check for content after the video link
            let line = token.line;
            if (line.includes("youtube.com") || line.includes("youtu.be")) {
              addErrorContext(onError, token.lineNumber, token.line);
            }
          }
        }
      }
    );
  },
};
