import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  forEachLine,
  isInCodeBlock,
  makeTokenCache,
} from "../shared";

/**
 * Check for git merge conflict lines in the Markdown source.
 * @param {FilterParams} params - Parameters for the markdownlint rule.
 * @param {function} onError - Function to report an error.
 */
function AM029(params: FilterParams, onError: (context: ErrorContext) => void) {
  makeTokenCache(params);
  var inCodeBlock = false;
  forEachLine(function forLine(line, lineIndex) {
    line = line.replace(/`{1}[^`].*?`{1}/, "CODE");
    const lineNumber = lineIndex + 1;
    inCodeBlock = isInCodeBlock(line, inCodeBlock);
    if (!inCodeBlock) {
      if (line.startsWith("<<<<<<< HEAD")) {
        addErrorContext(onError, lineNumber, line);
      }
    }
  });
}

module.exports = {
  names: ["AM029", "git-merge-conflict-lines"],
  description: "Markdown source contains git merge conflict lines",
  tags: ["warnings", "git-merge-conflict"],
  function: AM029,
};
