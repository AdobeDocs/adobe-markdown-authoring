"use strict";

import {
  addError,
  containsAfmTag,
  containsSingleLineAfmTag,
  ErrorContext,
  FilterParams,
} from "../shared";
import { MarkdownItToken } from "markdownlint";

module.exports = {
  names: ["AM028", "empty-admonition-block"],
  description: "Admonition has blank line or no content",
  tags: ["blockquote", "whitespace"],
  function: function AM028(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    params.tokens.forEach(function forToken(token: MarkdownItToken) {
      if (token.type === "blockquote_open") {
        if (containsAfmTag(token.line)) {
          var admonitionContentLength = 0;
          var numlines = token.map[1] - token.map[0];
          if (numlines < 2 && !containsSingleLineAfmTag(token.line)) {
            addError(
              onError,
              token.lineNumber,
              "Admonition has blank line or no content",
              token.line
            );
          } else if (!containsSingleLineAfmTag(token.line)) {
            for (let i = token.map[0] + 1; i < token.map[1]; i++) {
              var line = params.lines[i].replace(/[\s]*>/, "").trim();
              admonitionContentLength = admonitionContentLength + line.length;
            }
            if (admonitionContentLength === 0) {
              addError(
                onError,
                token.lineNumber,
                "Admonition has blank line or no content",
                token.line
              );
            }
          }
        }
      }
    });

    // check for blank lines in non-afm block quote
    var prevToken: MarkdownItToken;
    params.tokens.forEach(function forToken(token: MarkdownItToken) {
      if (
        token.type === "blockquote_open" &&
        prevToken?.type === "blockquote_close" &&
        !containsAfmTag(token.line) &&
        !containsSingleLineAfmTag(token.line)
      ) {
        addError(
          onError,
          token.lineNumber - 1,
          "Blank lines in non-afm blockquote",
          token.line
        );
      }
      prevToken = token;
    });
  },
};
