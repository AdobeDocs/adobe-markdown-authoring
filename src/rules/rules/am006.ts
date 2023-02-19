"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  forEachLine,
  makeTokenCache,
} from "../shared";

/**
 * Detects invisible dodgy-characters and control characters
 * @param {FilterParams} params The filter parameters
 * @param {function(ErrorContext):void} onError The error handler
 */
function AM006(params: FilterParams, onError: (context: ErrorContext) => void) {
  makeTokenCache(params);
  forEachLine(function forLine(line, lineIndex) {
    const lineNumber = lineIndex + 1;
    if (line.match(/[\x00-\x08\x0A-\x0F]/)) {
      addErrorContext(onError, lineNumber, line);
    }
  });
}

module.exports = {
  names: ["AM006", "dodgy-characters"],
  description: "Detects invisible dodgy-characters and control characters",
  tags: ["control-characters"],
  function: AM006,
};
