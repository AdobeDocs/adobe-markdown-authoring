import { addError, ErrorContext, FilterParams, filterTokens } from "../shared";
import { MarkdownItToken } from "markdownlint";

export const AM023 = (
  params: FilterParams,
  onError: (context: ErrorContext) => void
): void => {
  filterTokens(params, "table_open", (token: MarkdownItToken): void => {
    // remove whitespace and > if it's a note block
    const line = token.line.trim().replace(/^>/, "").trim();
    if (!line.startsWith("|")) {
      const lineNumber = token.lineNumber;
      addError(onError, lineNumber, "Missing Table pipes", line);
    }
  });
};

module.exports = {
  names: ["AM023", "missing-table-pipes"],
  description: "Table must use outer pipes",
  tags: ["tables"],
  function: AM023,
};
