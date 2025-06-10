import * as fs from "fs";
import * as path from "path";
import StateCore from "markdown-it/lib/rules_core/state_core";

const INCLUDE_RE: RegExp = /\{\{\$include\s+(.+)\}\}/i;
const SNIPPET_RE: RegExp = /\{\{(.+)\}\}/i;
const SNIPPET_HEADER_RE: RegExp = /##\s+(.*)\{#(.*)\}/i;
const SNIPPET_FILE: string = "help/_includes/snippets.md";
const NOT_FOUND_MESSAGE: string = "File '{{FILE}}' not found.";
const CIRCULAR_MESSAGE: string =
  "Circular reference between '{{FILE}}' and '{{PARENT}}'.";

interface ISnippet {
  name: string;
  text: string;
  content: string;
}

interface ISnippetHash {
  [key: string]: ISnippet;
}

/**
 * Find all {{$include <path>}} tags and replace them with the contents of the named file.  This is a recursive function.
 *  */
function replaceIncludes(
  src: string,
  rootDir: string,
  parentFilePath?: string,
  filesProcessed?: string[]
): string {
  filesProcessed = filesProcessed ? filesProcessed.slice() : []; // making a copy

  let cap, filePath, mdSrc, errorMessage; // store parent file path to check circular references

  if (parentFilePath) {
    filesProcessed.push(parentFilePath);
  }

  while ((cap = INCLUDE_RE.exec(src))) {
    let includePath = cap[1].trim();
    filePath = path.join(rootDir, includePath); // check if child file exists or if there is a circular reference
    if (!fs.existsSync(filePath)) {
      // child file does not exist
      errorMessage = NOT_FOUND_MESSAGE.replace("{{FILE}}", filePath);
    } else if (filesProcessed.indexOf(filePath) !== -1) {
      // reference would be circular
      errorMessage = CIRCULAR_MESSAGE.replace("{{FILE}}", filePath).replace(
        "{{PARENT}}",
        parentFilePath || "**UNKNOWN**"
      );
    }

    if (errorMessage) {
      mdSrc = `\n\n# INCLUDE ERROR: ${errorMessage}\n\n`;
    } else {
      // get content of child file
      mdSrc = fs.readFileSync(filePath, "utf8"); // check if child file also has includes
      mdSrc = replaceIncludes(
        mdSrc,
        path.dirname(filePath),
        filePath,
        filesProcessed
      );
      // remove one trailing newline, if it exists: that way, the included content does NOT
      // automatically terminate the paragraph it is in due to the writer of the included
      // part having terminated the content with a newline.
      // However, when that snippet writer terminated with TWO (or more) newlines, these, minus one,
      // will be merged with the newline after the #include statement, resulting in a 2-NL paragraph
      // termination.
      const len = mdSrc.length;
      if (mdSrc[len - 1] === "\n") {
        mdSrc = mdSrc.substring(0, len - 1);
      }
    } // replace include by file content

    src =
      src.slice(0, cap.index) +
      mdSrc +
      src.slice(cap.index + cap[0].length, src.length);
  }

  return src;
}

/**
 * Load the snippets file and return a hash of snippets.  For Experience League editing , the snippets file path
 * is hard-coded to be in the 'help/_includes/snippets.md' directory.
 * @returns  {string} the content of the snippet file
 */
function loadSnippetsFile(rootDir: string): ISnippetHash {
  const snippetFile = path.join(rootDir, SNIPPET_FILE);
  const localSnippets: ISnippetHash = {};
  if (fs.existsSync(snippetFile)) {
    const snippetContent: string = fs.readFileSync(snippetFile, "utf8");
    const snippetLines: string[] = snippetContent.split("\n");
    let snippet: ISnippet = { name: "", text: "", content: "" };
    let snippetName: string = "";
    snippetLines.forEach((line: string) => {
      const lineStr: string = line.toString().trim();
      const match: RegExpExecArray | null = SNIPPET_HEADER_RE.exec(lineStr);
      if (match) {
        const text = match[1];
        snippetName = match[2];
        snippet = {
          name: snippetName,
          text: text,
          content: "",
        };
        localSnippets[snippetName] = snippet;
      } else if (snippetName) {
        if (localSnippets[snippetName].content) {
          localSnippets[snippetName].content += "\n" + lineStr;
        } else {
          localSnippets[snippetName].content = lineStr;
        }
      }
    });
  }
  return localSnippets;
}

function replaceSnippets(src: string, rootDir: string): string {
  let snippets: ISnippetHash = loadSnippetsFile(rootDir);
  if (!snippets) {
    return src;
  }

  let cap: RegExpExecArray | null;

  while ((cap = SNIPPET_RE.exec(src))) {
    let snippetName = cap[1].trim();
    let mdSrc = snippets[snippetName]
      ? snippets[snippetName].content
      : `*** ERROR: Snippet ${snippetName} not found. ***`;
    src =
      src.slice(0, cap.index) +
      mdSrc +
      src.slice(cap.index + cap[0].length, src.length);
  }
  return src;
}

/**
 * Cleans up problematic token structures that can occur when snippets are followed by inline code.
 * This prevents the issue where text between snippets and code blocks gets a box around it.
 */
function cleanupSnippetCodeInteractions(src: string): string {
  // Look for patterns where a snippet (which often renders as a div or block element)
  // is followed by text and then inline code
  const snippetCodePattern = /(\{\{[^}]+\}\})([\s\S]*?)(`[^`]+`)/g;

  // Replace with a structure that prevents unwanted styling interactions
  return src.replace(snippetCodePattern, (match, snippet, text, code) => {
    // If there's no text between the snippet and code, no need to modify
    if (!text.trim()) {
      return `${snippet}${text}${code}`;
    }

    // Add a special marker that will be used to ensure proper separation
    // between the snippet and subsequent text with inline code
    return `${snippet}\n\n${text.trim()}${code}`;
  });
}

/**
 * Process includes and snippets in markdown content
 */
export function includeFileParts(state: StateCore, rootDir?: string) {
  // Check if rootDir is provided and is a string. If not, log a warning and proceed without modifying state.src
  if (typeof rootDir !== "string") {
    console.warn(
      "Warning: includeFileParts was called without a valid rootDir. The !INCLUDE tag not work as expected."
    );
    return;
  } else {
    // Proceed with the operation as rootDir is valid
    state.src = replaceIncludes(state.src, rootDir);
    state.src = replaceSnippets(state.src, rootDir);

    // Add cleanup step to fix snippet-code interactions
    state.src = cleanupSnippetCodeInteractions(state.src);
  }
}
