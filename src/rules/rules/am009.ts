"use strict";

import {
  addErrorContext,
  addWarningContext,
  alltags,
  blocktags,
  blocktags_with_options,
  containsAfmTag,
  ErrorContext,
  FilterParams,
  filterTokens,
  forEachLine,
  inlinetags,
  isInCodeBlock,
  makeTokenCache,
} from "../shared";
import { MarkdownItToken } from "markdownlint";

/**
 * Linter rule to check for malformed Adobe Markdown.
 * This rule checks for a number of possible issues:
 *  - stray AFM admonitions outside of blockquote
 *  - malformed UICONTROL/DNL tags
 *  - admonitions in non-comment html block
 *  - incorrect use of inline and block tags
 *  - misindentation in block quotes
 *
 * @module AM009
 * @param {FilterParams} params - A FilterParams object containing the lines of the markdown document, amongst other parameters.
 * @param {Function} onError - A function to be called when an error is detected.
 * @returns {void}
 */
module.exports = {
  names: ["AM009", "malformed-adobe-markdown-block"],
  description: "Malformed Adobe admonition markdown block.",
  tags: [
    "adobe-markdown",
    "admonitions",
    "blockquotes",
    "code-blocks",
    "html-blocks",
    "inline-tags",
    "block-tags",
  ],
  function: function AM009(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    makeTokenCache(params);
    var incodeblock = false;

    // check for stray AFM admonitions outside of blockquote or UICONTROL/DNL without brackets
    var curline = "";
    for (let i: number = 0; i < params.lines.length; i++) {
      if (i > 1) {
        incodeblock = isInCodeBlock(curline, incodeblock);
        curline = params.lines[i];
        var prevline = params.lines[i - 1];
        var prevprevline = params.lines[i - 2];
        // console.log(i + 1, curline)
        if (!incodeblock) {
          if (
            prevprevline.trim().startsWith(">") &&
            !prevline.trim().startsWith(">") &&
            curline.trim().startsWith(">") &&
            !curline.includes(">[!") &&
            prevline.trim() !== ""
          ) {
            var warn = false;
            // console.log(curline, curline.length)
            if (warn) {
              addWarningContext(
                params.name,
                (i + params.frontMatterLines.length).toString(),
                prevline,
                module.exports.names[0] +
                  "/" +
                  module.exports.names[1] +
                  ' AFM (NOTE) block line missing ">"'
              );
            } else {
              addErrorContext(
                onError,
                i,
                "",
                "No > on AFM (NOTE) block line: " + prevline.trim()
              );
            }
          }
        }
      }
    }

    // check for admonitions in non-comment html block
    filterTokens(params, "html_block", function forToken(token) {
      var lines = token.content.split("\n");
      if (!token.line.startsWith("<!--")) {
        lines.forEach(function forLine(line: string, lineNumber: number) {
          if (containsAfmTag(line)) {
            addErrorContext(
              onError,
              lineNumber + token.lineNumber,
              line,
              "Admonitions not supported in HTML: " + line.trim()
            );
          }
        });
      }
    });
    forEachLine(function forLine(line: string, lineIndex: number) {
      incodeblock = isInCodeBlock(line, incodeblock);
      if (!incodeblock) {
        var origline = line;
        line = line.replace(/`{1,3}.*?`{1,3}/g, " <code> ");

        if (!line.match(/^[\s]*\>\[/gm)) {
          // admonition outside of block
          if (containsAfmTag(line) && !line.includes("__BETA_")) {
            addErrorContext(onError, lineIndex + 1, line);
          }
        }

        var linetags = line.match(/\[![^\[].*?\]/g) || [];

        if (linetags.length > 0) {
          for (var i = 0; i < linetags.length; i++) {
            var tag = linetags[i].replace(/\[!(.*?)\]/, "$1").split(" ")[0];
            if (
              !tag.startsWith("__BETA_") &&
              !alltags.includes(tag) &&
              !line.match(/^\s*>/)
            ) {
              addErrorContext(onError, lineIndex + 1, line);
            }
          }
        }
        // lower case DNL or UICONTROL
        if (line.match(/\[\!uicontrol/) || line.match(/\[\!dnl/)) {
          addErrorContext(onError, lineIndex + 1, line);
        }

        // !DNL without brackets
        if (line.match(/[^\[]\!UICONTROL/) || line.match(/[^\[]\!DNL/)) {
          addErrorContext(onError, lineIndex + 1, line);
        }

        // DNL with brackets, but no! [DNL foo]
        if (line.match(/[\[]UICONTROL/) || line.match(/[\[]DNL/)) {
          addErrorContext(onError, lineIndex + 1, line);
        }

        // DNL with brackets, but in linktext [!DNL foo](link)
        if (
          line.match(/\[!UICONTROL\s[^\]]*?\]\(/) ||
          line.match(/\[!DNL\s[^\]]*?\]\(/)
        ) {
          addErrorContext(onError, lineIndex + 1, line);
        }

        // UICONTROL with space [!UI CONTROL ...]
        if (line.match(/[\[]!UI\s+CONTROL/)) {
          addErrorContext(onError, lineIndex + 1, line);
        }
      }
    });
    filterTokens(params, "blockquote_open", function forToken(token) {
      var line = token.line;
      var oline = token.map[0];
      var cline = token.map[1];

      var indent = token.line.indexOf(">");
      // console.log(token)
      for (let i = oline; i < cline; i++) {
        // console.log(params.lines[i])
        var lineindent = params.lines[i].indexOf(">");
        if (lineindent !== indent) {
          if (lineindent < 0) {
            addErrorContext(
              onError,
              i + 1,
              indent.toString(),
              lineindent,
              "Missing blockquote marker (>) or newline"
            );
          } else {
            addErrorContext(
              onError,
              i + 1,
              indent.toString(),
              lineindent,
              "Mismatched Indent for Block Quote"
            );
          }
        }
      }
      // console.log(token)
      // console.log(token.lineNumber + params.frontMatterLines.length)
      // console.log(token.line)
      // console.log(indent)
      if (token.line.indexOf("[!") > 0) {
        // is it AFM component

        // TODO: split the tag out here
        var afmtag = line.split(/[\[\]]/)[1];

        if (
          afmtag.includes("!") &&
          !blocktags.includes(afmtag.replace("!", "")) &&
          afmtag !== "!VIDEO" &&
          !afmtag.startsWith("!__BETA")
        ) {
          if (
            afmtag.split(" ").length > 1 &&
            blocktags_with_options.includes(
              afmtag.split(" ")[0].replace("!", "")
            )
          ) {
            //good
          } else {
            addErrorContext(onError, token.lineNumber, token.line);
          }
        }
        if (!containsAfmTag(token.line)) {
          addErrorContext(onError, token.lineNumber, token.line);
        }
        if (token.line.match(/[\>]*\s+\[!/)) {
          addErrorContext(onError, token.lineNumber, token.line);
        }
        var trimmed = token.line.trim().replace(/\].*$/, "]");

        if (
          token.line.trim() !== trimmed &&
          token.line.indexOf("[!VIDEO]") <= 0
        ) {
          // check for content after end of the container declaration
          addErrorContext(onError, token.lineNumber, token.line);
        }

        // if (token.line.indexOf('[!VIDEO]') > 0) {
        //     // check for content after the video link
        //     trimmed = token.line.trim().replace(/\).*$/, ')')
        //     if (token.line.trim() !==trimmed) {
        //         addErrorContext(onError, token.lineNumber, token.line);
        //     }
        // }
      } else {
        var afmtag = line.split(/[\[\]]/)[1];

        // check for afm blocks without ! eg,  >[NOTE]
        for (var i = 0, len = blocktags.length; i < len; i++) {
          var repattern = "[\\s]*>\\s*\\[" + blocktags[i] + "\\s*\\]";
          var re = new RegExp(repattern);
          if (token.line.match(re) !== null) {
            addErrorContext(onError, token.lineNumber, token.line);
          }
        }
        // check for afm blocks with extra text ! eg,  >[NOTE]
        for (let i = 0, len = blocktags.length; i < len; i++) {
          var nobang_pattern = "[\\s]*>\\s*\\[!" + blocktags[i] + "\\s*\\]";
          var textafterafm_pattern =
            "[\\s]*>\\s*\\[!" + blocktags[i] + "\\s*\\]";
          var re = new RegExp(nobang_pattern);
          if (token.line.match(re) !== null) {
            // addErrorContext(onError, token.lineNumber, token.line);
          }
        }
        /*
                        !AFM
                        AFM
                    */
        // check for afm tags without ! eg,  [DNL blah]
        for (let i = 0, len = inlinetags.length; i < len; i++) {
          var repattern = "[\\s]*\\s*\\[" + inlinetags[i] + ".*?\\]";
          var re = new RegExp(repattern);
          if (token.line.match(re) !== null) {
            addErrorContext(onError, token.lineNumber, token.line);
          }
        }
      }
    });
  },
};
