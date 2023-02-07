"use strict";

import {
  addErrorContext,
  ErrorContext,
  FilterParams,
  forEachLine,
} from "../shared";

module.exports = {
  names: ["AM006", "dodgy-characters"],
  description: "Detects invisible dodgy-characters and control characters",
  tags: ["control-characters"],
  function: function AM006(
    params: FilterParams,
    onError: (context: ErrorContext) => void
  ) {
    forEachLine(function forLine(line, lineIndex) {
      const lineNumber = lineIndex + 1;
      if (line.match(/[\x00-\x08\x0A-\x0F]/)) {
        addErrorContext(onError, lineNumber, line);
      }
    });
  },
};
