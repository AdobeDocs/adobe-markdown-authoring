import { addErrorContext, ErrorContext, FilterParams } from "../shared";

/**
 * AM015 - malformed-html-comment
 * HTML comment is malformed.
 *
 * @param params FilterParams object
 * @param onError function to call with any errors
 */
export function AM015(
  params: FilterParams,
  onError: (ctx: ErrorContext) => void
) {
  let openComment = false;
  let lastLineNumber = 0;
  let lastLine = "";
  let inComment = false;

  for (let i = 0; i < params.lines.length; i++) {
    const line = params.lines[i];
    const commentStart = line.indexOf("<!--");
    const commentEnd = line.indexOf("-->", commentStart);

    if (inComment) {
      // we're currently in a comment
      if (commentEnd >= 0) {
        // we found the end of the comment on this line
        inComment = false;
        openComment = false;
      } else {
        // the comment hasn't ended yet
        addErrorContext(onError, i + 1, line.trim(), params.name);
      }
    } else if (
      commentStart >= 0 &&
      commentEnd >= 0 &&
      commentStart < commentEnd
    ) {
      // this is a properly formed comment
      openComment = false;
    } else if (commentStart >= 0) {
      // this is the start of a comment that is not closed yet
      if (openComment) {
        addErrorContext(
          onError,
          lastLineNumber + 1,
          lastLine.trim(),
          params.name
        );
      }
      inComment = true;
      openComment = true;
      lastLineNumber = i;
      lastLine = line;
    } else if (commentEnd >= 0) {
      // this is a comment end with no start
      addErrorContext(onError, i + 1, line.trim(), params.name);
    } else if (openComment) {
      // this line is part of a comment that was opened on a previous line
      addErrorContext(onError, i + 1, line.trim(), params.name);
    }
  }

  if (openComment) {
    addErrorContext(onError, lastLineNumber + 1, lastLine.trim(), params.name);
  }
}

module.exports = {
  names: ["AM015", "malformed-html-comment"],
  description: "HTML comment is malformed",
  tags: ["html"],
  function: AM015,
};
