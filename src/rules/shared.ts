"use strict";

import { MarkdownItToken } from "markdownlint";

type TokenContext = {
  unordered: boolean;
  parentsUnordered: boolean;
  indent: number;
  lastLineIndex: number;
  insert?: number;
  items: MarkdownItToken[];
  open?: MarkdownItToken;
  parentIndent?: number;
  nesting?: number;
};

export type ErrorContext = {
  lineNumber: number;
  detail?: string | null;
  line: string;
  range: number[];
};

export type FilterParams = {
  name: string;
  lines: string[];
  frontMatterLines: string[];
  tokens: MarkdownItToken[];
};


// Regular expression for matching common newline characters
// See NEWLINES_RE in markdown-it/lib/rules_core/normalize.js
export const newLineRe: RegExp = /\r[\n\u0085]?|[\n\u2424\u2028\u0085]/;

// Regular expression for matching common front matter (YAML and TOML)
export const frontMatterRe: RegExp = /^(---|\+\+\+)$[^]*?^\1$(\r\n|\r|\n)/m;

// Regular expression for matching inline disable/enable comments
export const inlineCommentRe: RegExp =
  /<!--\s*markdownlint-(dis|en)able((?:\s+[a-z0-9_-]+)*)\s*-->/ig;

// Regular expressions for range matching
export const atxHeadingSpaceRe: RegExp = /^#+\s*\S/;
export const bareUrlRe: RegExp = /(?:http|ftp)s?:\/\/[^\s]*/i;
export const listItemMarkerRe: RegExp = /^[\s>]*(?:[*+-]|\d+[.)])\s+/;
export const orderedListItemMarkerRe: RegExp = /^[\s>]*0*(\d+)[.)]/;

// readFile options for reading with the UTF-8 encoding
export const utf8Encoding = { "encoding": "utf8" };

export const blocktags = [
  'NOTE',
  'TIP',
  'IMPORTANT',
  'WARNING',
  'CAUTION',
  'VIDEO',
  'MORELIKETHIS',
  'CONTEXTUALHELP',
  'ADMIN',
  'AVAILABILITY',
  'PREREQUISITES',
  'Related Articles',
  'ERROR',
  'SUCCESS',
  'INFO',
  '__BETA_',
  'TAB',
  'BEGINSHADEBOX',
  'ENDSHADEBOX',
  'BEGINTABS',
  'ENDTABS'
];

export const blocktags_with_options = [
  'TAB',
  'BEGINSHADEBOX',
  'BEGINTABS'
];

export const inlinetags = [
  'UICONTROL',
  'DNL',
  '__BETA_',
  'BADGE'
];


export const singleLineBlocktags = [
  'VIDEO',
  '__BETA',
  'BEGINTABS',
  'ENDTABS',
  'TAB',
  'BEGINSHADEBOX',
  'ENDSHADEBOX'
];

export const containsSingleLineAfmTag = (line: string) => {
  var foundtag = false;
  for (var i = 0, len = singleLineBlocktags.length; i < len; i++) {
    var tags = line.match('!' + singleLineBlocktags[i]);
    if (!foundtag) {
      if (tags !== null) {
        foundtag = true;
      } else {
        foundtag = false;
      }
    }
  }
  return foundtag;
};

export const alltags = blocktags.concat(inlinetags);

export const containsAfmTag = (line: any) => {
  var foundtag = false;
  for (var i = 0, len = blocktags.length; i < len; i++) {
    var tags = line.match('!' + blocktags[i]);
    if (!foundtag) {
      if (tags! += null) {
        foundtag = true;
      } else {
        foundtag = false;
      }
    }
  }
  return foundtag;
};

// slugify string
export const slugify = (str: string) => {
  var slug: string = encodeURIComponent(String(str).trim().toLowerCase().replace(/\s+/g, '-'));
  return slug;
};

// Trims whitespace from the left (start) of a string
export const trimLeft = (str: string) => {
  return str.replace(/^\s*/, "");
};

// Trims whitespace from the right (end) of a string
export const trimRight = function trimRight(str: string) {
  return str.replace(/\s*$/, "");
};

// Applies key/value pairs from src to dst, returning dst
export const assign = (dst: { [x: string]: any; }, src: { [x: string]: any; }) => {
  Object.keys(src).forEach(function forKey(key) {
    dst[key] = src[key];
  });
  return dst;
};

// Clones the key/value pairs of obj, returning the clone
export const clone = (obj: any) => {
  return assign({}, obj);
};

// Returns true iff the input is a number
export const isNumber = (obj: any) => {
  return typeof obj === "number";
};

// Returns true iff the input is a string
export const isString = (obj: any) => {
  return typeof obj === "string";
};

// Returns true iff the input string is empty
export const isEmptyString = (str: string | any[]) => {
  return str.length === 0;
};

// Replaces the text of all properly-formatted HTML comments with whitespace
// This preserves the line/column information for the rest of the document
// Trailing whitespace is avoided with a '\' character in the last column
// See https://www.w3.org/TR/html5/syntax.html#comments for details
const htmlCommentBegin = "<!--";
const htmlCommentEnd = "-->";
export const clearHtmlCommentText = (text: string) => {
  let i = 0;
  while ((i = text.indexOf(htmlCommentBegin, i)) !== -1) {
    const j = text.indexOf(htmlCommentEnd, i);
    if (j === -1) {
      // Un-terminated comments are treated as text
      break;
    }
    const comment = text.slice(i + htmlCommentBegin.length, j);
    if ((comment.length > 0) &&
      (comment[0] !== ">") &&
      (comment[comment.length - 1] !== "-") &&
      !comment.includes(htmlCommentBegin) && !comment.includes(htmlCommentEnd) &&
      (text.slice(i, j + htmlCommentEnd.length)
        .search(inlineCommentRe) === -1)) {
      const blanks = comment
        .replace(/[^\r\n]/g, " ")
        .replace(/ ([\r\n])/g, "$1");
      text = text.slice(0, i + htmlCommentBegin.length) +
        blanks + text.slice(j);
    }
    i = j + htmlCommentEnd.length;
  }
  return text;
};


// Escapes a string for use in a RegExp
export const escapeForRegExp = function escapeForRegExp(str: string) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};

// Returns the indent for a token
export const indentFor = (token: MarkdownItToken) => {
  const line = token.line.replace(/^[\s>]*(> |>)/, "");
  return line.length - trimLeft(line).length;
};

// Returns the heading style for a heading token
export const headingStyleFor = function headingStyleFor(token: MarkdownItToken) {
  if ((token.map[1] - token.map[0]) === 1) {
    if (/[^\\]#\s*$/.test(token.line)) {
      return "atx_closed";
    }
    return "atx";
  }
  return "setext";
};

// Calls the provided function for each matching token
export const filterTokens = (params: FilterParams, type: string, callback: { (token: any): void; (token: any): void; (token: any): void; (arg0: any): void; }) => {
  params.tokens.forEach(function forToken(token: MarkdownItToken) {
    if (token.type === type) {
      callback(token);
    }
  });
};

let tokenCache: { params: FilterParams; lineMetadata: any; flattenedLists: any; } | null = null;
// Caches line metadata and flattened lists for reuse
export const makeTokenCache = (params: FilterParams | null) => {
  if (!params) {
    tokenCache = null;
    return;
  }

  // Populate line metadata array
  const lineMetadata = new Array(params.lines.length);
  let fenceStart: string | null = null;
  let inFence = false;
  // Find fenced code by pattern (parser ignores "``` close fence")
  params.lines.forEach((line: string, lineIndex: number) => {
    let metadata = 0;
    const match = /^[ ]{0,3}(`{3,}|~{3,})/.exec(line);  // doesn't match 4 spaces before the fence... :/

    // Make sure inline ```code``` blocks are not treated as a fench - UGP-4507
    const match_inline = /^[ ]*(`{3,}|~{3,}).*?(`{3,}|~{3,})/g.exec(line);
    var fence = null;
    if (!match_inline) {
      fence = match && match[1];
    }

    if (fence && fenceStart &&
      (!inFence || (fence.substring(0, fenceStart.length) === fenceStart))) {
      metadata = inFence ? 2 : 6;
      fenceStart = inFence ? null : fence;
      inFence = inFence;
    } else if (inFence) {
      metadata = 1;
    }
    lineMetadata[lineIndex] = metadata;
  });

  // Find code blocks normally
  filterTokens(params, "code_block", function forToken(token: MarkdownItToken) {
    for (let i = token.map[0]; i < token.map[1]; i++) {
      lineMetadata[i] = 1;
    }
  });
  // Find tables normally
  filterTokens(params, "table_open", function forToken(token: MarkdownItToken) {
    for (let i = token.map[0]; i < token.map[1]; i++) {
      lineMetadata[i] += 8;
    }
  });

  // Flatten lists
  const flattenedLists: any[] = [];
  const stack: any[] = [];
  let current: TokenContext | null = null;
  let lastWithMap = { "map": [0, 1] };
  params.tokens.forEach(function forToken(token: MarkdownItToken) {
    if ((token.type === "bullet_list_open") ||
      (token.type === "ordered_list_open")) {
      // Save current context and start a new one
      stack.push(current);
      current = {
        "unordered": (token.type === "bullet_list_open"),
        "parentsUnordered": !current ||
          (current.unordered && current.parentsUnordered),
        "open": token,
        "indent": indentFor(token),
        "parentIndent": (current && current.indent) || 0,
        "items": [],
        "nesting": stack.length - 1,
        "lastLineIndex": -1,
        "insert": flattenedLists.length
      };
    } else if ((token.type === "bullet_list_close") ||
      (token.type === "ordered_list_close")) {
      if (!current) {
        return;
      }
      // Finalize current context and restore previous
      current.lastLineIndex = lastWithMap.map[1];
      flattenedLists.splice(current?.insert || 0, 0, current);
      delete current?.insert;
      current = stack.pop();
    } else if (token.type === "list_item_open") {
      // Add list item
      current?.items.push(token);
    } else if (token.map) {
      // Track last token with map
      lastWithMap = token;
    }
  });

  // Cache results
  tokenCache = {
    "params": params,
    "lineMetadata": lineMetadata,
    "flattenedLists": flattenedLists
  };
};

// Calls the provided function for each line (with context)
export const forEachLine = function forEachLine(callback: (arg0: any, arg1: any, arg2: boolean, arg3: number, arg4: boolean) => void) {
  // Invoke callback
  tokenCache?.params.lines.forEach(function forLine(line: any, lineIndex: string | number) {
    const metadata = tokenCache?.lineMetadata[lineIndex];
    callback(
      line,
      lineIndex,
      !!(metadata & 7),
      (((metadata & 6) >> 1) || 2) - 2,
      !!(metadata & 8));
  });
};

// Calls the provided function for each specified inline child token
export const forEachInlineChild =
  function forEachInlineChild(params: FilterParams, type: any, callback: (arg0: any, arg1: any) => void) {
    filterTokens(params, "inline", function forToken(token: MarkdownItToken) {
      token.children.forEach(function forChild(child: { type: any; }) {
        if (child.type === type) {
          callback(child, token);
        }
      });
    });
  };

// Calls the provided function for each heading's content
export const forEachHeading = function forEachHeading(params: FilterParams, callback: (heading: MarkdownItToken, content: string) => void) {
  let heading: MarkdownItToken | null = null;
  params.tokens.forEach((token: MarkdownItToken) => {
    if (token.type === "heading_open") {
      heading = token;
    } else if (token.type === "heading_close") {
      heading = null;
    } else if ((token.type === "inline") && heading) {
      callback(heading, token.content);
    }
  });
};

// Returns (nested) lists as a flat array (in order)
export const flattenLists = function flattenLists() {
  return tokenCache?.flattenedLists;
};

// Adds a generic error object via the onError callback
export const addError = (onError: (ctx: ErrorContext) => void, lineNumber: number, detail: string | null, line: string, range?: any) => {
  onError({ lineNumber, detail, line, range });
};

// Adds an error object with details conditionally via the onError callback
export const addErrorDetailIf = (
  onError: (ctx: ErrorContext) => void, lineNumber: number, expected: string, actual: string, detail: string | null, range?: number[]) => {
  if (expected !== actual) {
    addError(
      onError,
      lineNumber,
      (expected ? "Expected: " + expected + "; Actual: " : "") + actual + (detail ? "; " + detail : ""),
      "",
      range);
  }
};

// Adds an error object with context via the onError callback
export const addErrorContext =
  (onError: (ctx: ErrorContext) => void, lineNumber: number, line: string, left?: any, right?: any, range?: number[]) => {
    if (line.length <= 30) {
      // Nothing to do
    } else if (left && right) {
      line = line.substring(0, 15) + "..." + line.substring(-15);
    } else if (right) {
      line = "..." + line.substring(-30);
    } else {
      line = line.substring(0, 30) + "...";
    }
    addError(onError, lineNumber, null, line, range);
  };

export const addWarningContext =
  (filename: string, linenumber: string, line: string, rule: string) => {
    if (line.length <= 30) {
      // Nothing to do
    } else {
      line = line.substring(0, 30) + "...";
    }
    if (line.length > 0) {
      line = ': ' + line;
    }
    console.log('[WARN] ' + filename + ': ' + linenumber + ': ' + rule + line);
  };

// Returns a range object for a line by applying a RegExp
export const rangeFromRegExp = (line: string, regexp: RegExp) => {
  let range = null;
  const match = line.match(regexp);
  if (match && match.index) {
    let column = match?.index + 1;
    let length = match[0].length;
    if (match[2]) {
      column += match[1].length;
      length -= match[1].length;
    }
    range = [column, length];
  }
  return range;
};

// Check if we are in a code block
export const isInCodeBlock = (line: string, incode: any) => {
  const codeBlockRe = new RegExp("^[\\s]*[>]*[\\s]*```[^`]*$");
  var incodeblock = incode;
  const codeBlockMatch = codeBlockRe.exec(line);
  if (codeBlockMatch) {
    incodeblock = !incodeblock;
  }
  return incodeblock;
};
