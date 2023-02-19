import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  filterTokens,
} from "../shared";
import { MarkdownItToken } from "markdownlint";

function AM024(params: FilterParams, onError: (context: ErrorContext) => void) {
  filterTokens(
    params,
    "list_item_open",
    function forToken(token: MarkdownItToken) {
      // console.log(token)
      let match = /^[0-9*+-]+[\.]*$/.exec(token.line.trim());
      if (match) {
        addErrorContext(onError, token.lineNumber, token.line);
      }
    }
  );
}

module.exports = {
  names: ["AM024", "List item bullet/number on line by itself"],
  description: "List items should contain content on bullet line",
  tags: ["bullet", "ul", "ol"],
  function: AM024,
};
