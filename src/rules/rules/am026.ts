import { addError, ErrorContext, FilterParams, filterTokens } from "../shared";
import { MarkdownItToken } from "markdownlint";

function am026(
  params: FilterParams,
  onError: (context: ErrorContext) => void
): void {
  filterTokens(params, "table_open", function forToken(token: MarkdownItToken) {
    // remove whitespace and > if it's a note block
    const indent = token.line.replace(/^>/, "").search(/\S/);
    const beginWithFM = token.map[0] + params.frontMatterLines.length + 1;
    const endWithFM = token.map[1] + params.frontMatterLines.length;

    params.lines.forEach(function forLine(line, lineIndex) {
      // remove whitespace and > if it's a note block
      line = line.replace(/^>/, "");
      const lineIndexWithFM = lineIndex + params.frontMatterLines.length + 1;

      if (lineIndexWithFM >= beginWithFM && lineIndexWithFM <= endWithFM) {
        const lineIndent = line.search(/\S/);

        if (line !== "") {
          if (lineIndent !== indent) {
            addError(
              onError,
              lineIndex + 1,
              "Expected indent " + indent + " found " + lineIndent,
              line
            );
          }
        }
      }
    });
  });
}

module.exports = {
  names: ["AM026", "table-indent"],
  description: "Table must use consistent indent level",
  tags: ["tables"],
  function: am026,
};
