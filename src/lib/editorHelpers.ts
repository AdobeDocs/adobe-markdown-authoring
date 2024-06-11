import * as vscode from "vscode";
import {
  Selection,
  TextEditor,
  TextDocument,
  Range,
  Position,
  TextEditorEdit,
} from "vscode";

/**
 * Replaces the selected text in the active text editor with the result of the replace function.
 * @param replaceFunc The function used to replace the selected text.
 * @returns A promise that resolves to true if the replace operation was successful, or false if there is no active text editor.
 */
export function replaceSelection(
  replaceFunc: (text: string) => string
): Thenable<boolean> {
  // Get the active text editor
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;
  // If there is no active text editor, return a resolved promise with false
  if (!editor) {
    return Promise.resolve(false);
  }
  // Get the selection from the active text editor
  const selection: Selection = editor.selection;

  // Replace the selected text with the result of the replace function
  var newText: string = replaceFunc(editor.document.getText(selection));
  // Edit the text in the active text editor by replacing the selected text with the new text
  return editor.edit((edit) => edit.replace(selection, newText));
}

/**
 * Replaces the selected block of text in the active text editor with the result of the replace function.
 * @param replaceFunc The function used to replace the selected text.
 * @returns A promise that resolves to true if the replace operation was successful, or false if there is no active text editor.
 *          The promise is rejected with the message "No Selection to replace." if there is no block selection.
 */
export function replaceBlockSelection(
  replaceFunc: (text: string) => string
): Thenable<boolean> {
  // Get the active text editor
  const editor = vscode.window.activeTextEditor;
  // If there is no active text editor, return a resolved promise with false
  if (!editor) {
    return Promise.resolve(false);
  }
  // Get the selection from the active text editor
  const selection = getBlockSelection();
  // If there is no block selection, reject the promise with the message "No Selection to replace."
  if (!selection) {
    return Promise.reject("No Selection to replace.");
  }

  // Replace the selected text with the result of the replace function
  const newText = replaceFunc(editor.document.getText(selection));
  // Edit the text in the active text editor by replacing the selected text with the new text
  return editor
    .edit((edit) => edit.replace(selection, newText))
    .then((success) => {
      // If the replace operation was successful, update the selection to the new block selection
      const newSelection = getBlockSelection();
      if (newSelection) {
        editor.selection = newSelection;
      }
      // Return the success status of the replace operation
      return success;
    });
}

/**
 * Checks if anything is selected in the active text editor.
 *
 * @returns {boolean} True if there is an active text editor and it has a non-empty selection.
 *                   False otherwise.
 */
export function isAnythingSelected(): boolean {
  // Get the active text editor
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;

  // If there is no active text editor or the selection is empty, return false
  // Otherwise, return true
  return !!editor && !editor.selection.isEmpty;
}

export function surroundSelection(
  startPattern: string,
  endPattern: string,
  wordPattern?: RegExp
): Thenable<boolean> {
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;
  if (editor === undefined) {
    return Promise.reject("No Text Editor Defined");
  }
  let selection: Selection | void = editor.selection;
  if (selection === undefined) {
    return Promise.reject("Selection is undefined.");
  }

  if (!isAnythingSelected()) {
    const withSurroundingWord: Selection | void = getSurroundingWord(
      editor,
      selection,
      wordPattern
    );

    if (withSurroundingWord) {
      selection = editor.selection = withSurroundingWord;
    }
  }

  // Note, even though we're expanding selection, there's still a potential chance
  // for collapsed, e.g. empty file, or just an empty line.
  if (!isAnythingSelected()) {
    const position: Position = selection.active;
    var newPosition = position.with(
      position.line,
      position.character + startPattern.length
    );
    return editor
      .edit((editBuilder: TextEditorEdit) => {
        editBuilder.insert(position, startPattern + endPattern);
      })
      .then(() => {
        editor.selection = new Selection(newPosition, newPosition);
        return !!editor.selection;
      });
  } else if (isSelectionMatch(selection, startPattern)) {
    return replaceSelection((text: string): string =>
      text.substr(
        startPattern.length,
        text.length - startPattern.length - endPattern.length
      )
    );
  } else {
    return replaceSelection((text) => startPattern + text + endPattern);
  }
}

/**
 * Returns a selection that includes the block surrounded by the startPattern and endPattern.
 * If no surrounding block is found, the function returns the selection of the current paragraph.
 * If there is no paragraph, the selection returns a zero length selection at the current cursor position.
 * @param editor - The active TextEditor instance.
 * @param selection - The current selection in the editor.
 * @param startPattern - The start pattern to search for.
 * @param endPattern - The end pattern to search for.
 * @returns A new Selection that includes the block surrounded by startPattern and endPattern, or the current paragraph.
 */
export function getSurroundingBlock(
  editor: TextEditor,
  selection: Selection,
  startPattern: string,
  endPattern: string
): Selection | void {
  const doc = editor.document;
  const cursorPosition = selection.active;
  const startPatternRegex = new RegExp(extractFirstLineForRegex(startPattern));
  const endPatternRegex = new RegExp(processPatternForRegex(endPattern));

  let startPatternPosition: Position | null = findStartPatternPosition(
    doc,
    cursorPosition,
    startPatternRegex
  );
  let endPatternPosition: Position | null = findEndPatternPosition(
    doc,
    cursorPosition,
    endPatternRegex
  );

  if (startPatternPosition && endPatternPosition) {
    const selStart = new Position(
      startPatternPosition.line,
      startPatternPosition.character
    );
    const selEndLine = doc.lineAt(endPatternPosition.line);
    const selEnd = new Position(
      endPatternPosition.line,
      selEndLine.text.length
    );
    return new Selection(selStart, selEnd);
  } else {
    return getParagraphSelection(editor, selection);
  }
}

function findStartPatternPosition(
  doc: TextDocument,
  cursorPosition: Position,
  startPatternRegex: RegExp
): Position | null {
  let currentLine = cursorPosition.line;
  while (currentLine >= 0) {
    const lineText = doc.lineAt(currentLine).text;
    if (lineText.trim() === "") break;
    const startIndex = lineText.search(startPatternRegex);
    if (startIndex !== -1) return new Position(currentLine, startIndex);
    currentLine--;
  }
  return null;
}

function findEndPatternPosition(
  doc: TextDocument,
  cursorPosition: Position,
  endPatternRegex: RegExp
): Position | null {
  for (let line = cursorPosition.line; line < doc.lineCount; line++) {
    const lineText = doc.lineAt(line).text;
    const endIndex = lineText.search(endPatternRegex);
    if (endIndex !== -1) return new Position(line, endIndex);
  }
  return null;
}

/**
 * Returns a selection that includes the paragraph that the cursor is in.
 * It finds the first and last non-blank lines that include the cursor position.
 * @param editor - The active TextEditor instance.
 * @param selection - The current selection in the editor.
 * @returns A new Selection that includes the paragraph that the cursor is in.
 */
function getParagraphSelection(
  editor: TextEditor,
  selection: Selection
): Selection {
  const doc = editor.document;
  const cursorPosition = selection.active;
  let startLine = cursorPosition.line;
  // Find the first non-blank line above the cursor position
  while (startLine > 0 && !/^\s*$/.test(doc.lineAt(startLine).text)) {
    startLine--;
  }
  let endLine = cursorPosition.line;
  // Find the last non-blank line below the cursor position
  while (
    endLine < doc.lineCount - 1 &&
    !/^\s*$/.test(doc.lineAt(endLine).text)
  ) {
    endLine++;
  }
  return startLine < doc.lineCount && endLine >= 0
    ? new Selection(
        new Position(startLine + 1, 0),
        new Position(endLine, doc.lineAt(endLine).text.length)
      )
    : new Selection(cursorPosition, cursorPosition);
}

/**
 * Checks if a line is blank.
 * @param line - The line to check.
 * @returns Returns true if the line is blank, false otherwise.
 */
function isLineBlank(line: string): boolean {
  return /^\s*$/.test(line);
}

/**
 * Returns a selection that includes the first occurrence of the given pattern in the current line.
 * If no match is found, returns undefined.
 *
 * @param editor - The active TextEditor instance.
 * @param selection - The current selection in the editor.
 * @param pattern - The pattern to search for. Optional; if not provided, returns undefined.
 * @returns A new Selection that includes the first occurrence of the pattern, or undefined if no match is found.
 */
export function getSurroundingPattern(
  editor: TextEditor,
  selection: Selection,
  pattern?: RegExp
): Selection | void {
  // Get the current line
  const line: vscode.TextLine = editor.document.lineAt(selection.active);

  // Attempt to find the first occurrence of the pattern in the line
  const matched: RegExpExecArray | null | undefined = pattern?.exec(line.text);

  // If a match is found
  if (matched) {
    // Calculate the start and end positions of the selection
    const selStart = new Position(line.lineNumber, matched.index);
    const selEnd = new Position(
      line.lineNumber,
      matched.index + matched[0].length
    );

    // Return a new Selection spanning from start to end positions
    return new Selection(selStart, selEnd);
  } else {
    // If no match is found, return undefined
    return;
  }
}

/**
 * Retrieves the first word occurrence in the current line that matches the specified RegExp pattern.
 *
 * @param editor - The active TextEditor instance.
 * @param selection - The current selection in the editor.
 * @param wordPattern - A RegExp pattern to match against the words in the line. Optional.
 * @returns A new Selection spanning from the start to the end of the first word occurrence, or undefined if no match is found.
 */
export function getSurroundingWord(
  editor: TextEditor,
  selection: Selection,
  wordPattern?: RegExp
): Selection | void {
  // Get the range of the word at the current cursor position, if any
  var range: Range | undefined = editor.document.getWordRangeAtPosition(
    selection.active,
    wordPattern
  );

  // If no word is found at the cursor position, return undefined
  if (range === undefined) {
    return;
  } else {
    // Return a new Selection spanning from the start to the end of the word
    return new Selection(range.start, range.end);
  }
}

/**
 * Toggles the surrounding of a block selection with the given start and end patterns.
 * If the start and end patterns are in the selection, they are removed. If they are not in the selection, they are added.
 * @param startPattern - The start pattern to be toggled.
 * @param endPattern - The end pattern to be toggled (optional; defaults to the start pattern).
 * @param wordPattern - A RegExp pattern to be matched (optional).
 * @returns A Promise that resolves when the operation is completed or rejects if no editor or selection is available.
 */
export function surroundBlockSelection(
  startPattern: string,
  endPattern?: string,
  wordPattern?: RegExp
): Thenable<void | boolean> {
  // If end pattern is not provided, set it to the start pattern
  if (endPattern === undefined || endPattern === null) {
    endPattern = startPattern;
  }

  const editor: TextEditor | undefined = vscode.window.activeTextEditor;

  // If there is no active text editor, reject the promise
  if (!editor) {
    return Promise.reject("No Text Editor is Defined");
  }

  // Get the current selection
  let selection: void | Selection = getBlockSelection();

  // If there is no selection, reject the promise
  if (!selection) {
    return Promise.reject("No selection is available");
  }

  // If nothing is selected, try to find something to toggle
  if (!isAnythingSelected()) {
    // If the cursor is in a markdown block, select the block, otherwise return
    // a zero-length selection at the cursor position.
    var withSurroundingWord: Selection | void = getSurroundingBlock(
      editor,
      selection,
      startPattern,
      endPattern
    );

    // If a block is found, select it
    if (withSurroundingWord) {
      selection = editor.selection = withSurroundingWord;
    }
  }

  // If nothing is selected, insert the start and end patterns at the cursor position
  if (!isAnythingSelected()) {
    var position = selection.active;
    var newPosition = position.with(position.line + 2, 1);
    return editor
      .edit((editBuilder: TextEditorEdit) =>
        editBuilder.insert(position, `${startPattern}${endPattern}`)
      )
      .then(() => {
        editor.selection = new vscode.Selection(newPosition, newPosition);
      });
  } else {
    // If there is a selection, toggle the start and end patterns
    if (isSelectionMatch(selection, startPattern)) {
      return replaceBlockSelection((text) => {
        const start: number = startPattern.toString().length;
        const end: number = endPattern ? endPattern.toString().length : start;
        const len: number = text.length - start - end;
        return text.substr(start, len);
      });
    } else {
      const startPos = selection.start;
      const endPos = selection.end;

      return editor
        .edit((editBuilder: TextEditorEdit) => {
          // Insert start pattern at the start of the selection
          editBuilder.insert(startPos, startPattern);
          // Insert end pattern at the end of the selection
          editBuilder.insert(endPos, endPattern);
        })
        .then(() => {
          // Set the cursor at the end of the endPos line
          const cursorPos = endPos.with(
            endPos.line,
            editor.document.lineAt(endPos.line).text.length
          );
          editor.selection = new vscode.Selection(cursorPos, cursorPos);
        });
    }
  }
}

/**
 * Returns a new Selection object that spans from the start of the first non-empty line
 * in the current selection to the end of the last non-empty line in the current selection.
 * If the current selection is empty, the original selection is returned.
 *
 * @returns {Selection | void} A new Selection object or undefined if no active editor.
 */
export function getBlockSelection(): Selection | void {
  // Get the active text editor and selection
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const selection: Selection = editor.selection;

  // If the selection is empty, return it
  if (selection.isEmpty) {
    return selection;
  }

  // Return a new Selection object that spans from the start of the first non-empty line
  // in the current selection to the end of the last non-empty line in the current selection.
  const graf: Selection = getParagraphSelection(editor, selection);
  return graf;
}

/**
 * Returns a new Selection object that spans from the start of the current line
 * to the end of the current line. If there is no active text editor or selection,
 * it returns undefined.
 *
 * @returns {Selection | void} A new Selection object or undefined.
 */
export function getLineSelection(): Selection | void {
  // Get the active text editor and selection
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  // Get the current selection
  const selection: Selection = editor.selection;

  // Get the end character of the current line
  const endchar = editor.document.lineAt(selection.start.line).range.end
    .character;

  // Return a new Selection object that spans from the start of the current line
  // to the end character of the current line
  return new Selection(
    selection.start.with(selection.start.line, 0), // Start of current line
    selection.end.with(selection.start.line, endchar) // End of current line
  );
}

/**
 * Checks if the current block selection matches the given start pattern.
 * @param startPattern - The start pattern to check for (can be a string or a RegExp).
 * @returns true if the block selection matches the start pattern, false otherwise.
 */
export function isBlockMatch(startPattern: RegExp): boolean {
  // Get the current block selection
  const selection: void | Selection = getBlockSelection();

  // If there is no selection, return false
  if (!selection) {
    return false;
  }

  // Check if the current selection matches the start pattern
  return isSelectionMatch(selection, startPattern);
}

/**
 * Checks if the current selection matches the given start pattern.
 * @param startPattern - The start pattern to check for (can be a string or a RegExp).
 * @returns true if the current selection matches the start pattern, false otherwise.
 */
export function isMatch(startPattern: RegExp): boolean {
  // Get the active text editor and selection
  const editor: TextEditor | void = vscode.window.activeTextEditor;

  // If there is no active text editor, return false
  if (!editor) {
    return false;
  }

  // Check if the current selection matches the start pattern
  return isSelectionMatch(editor.selection, startPattern);
}

/**
 * Extracts the first line of a string, and escapes special characters to be used in a regular expression.
 * @param str - The string to be processed.
 * @returns The processed first line of the string with special characters escaped.
 */
function extractFirstLineForRegex(str: string): string {
  // Split the string into an array of lines and take the first one
  const firstLine = str.split("\n")[0];
  // Escapes special characters in the first line
  const escapedFirstLine = firstLine.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
  return escapedFirstLine;
}

/**
 * Removes newline characters and escapes special characters in a string to be used in a regular expression.
 * @param str - The string to be processed.
 * @returns The processed string with newline characters removed and special characters escaped.
 */
function processPatternForRegex(str: string): string {
  const stringWithoutNewlines = str.replace(/\n/g, "");
  return stringWithoutNewlines.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Checks if the current selection matches the given start and end patterns.
 * @param selection - The current Selection in the editor.
 * @param startPattern - The start pattern to check for (can be a string or a RegExp).
 * @returns true if the selection matches the start and end patterns, false otherwise.
 */
export function isSelectionMatch(
  selection: Selection,
  startPattern: RegExp | string
): boolean {
  const editor: TextEditor | void = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }
  const text = editor.document.getText(selection);

  const startPatternRegex =
    startPattern.constructor === RegExp
      ? (startPattern as RegExp)
      : new RegExp(extractFirstLineForRegex(startPattern.toString()), "m");

  const result = startPatternRegex.test(text);

  return result;
}

/**
 *
 * @param selection
 * @param pattern
 * @returns
 */
export function reSelect(selection: Selection, pattern: RegExp): Selection {
  const editor: TextEditor | void = vscode.window.activeTextEditor;
  if (!editor) {
    return selection;
  }
  const text = editor.document.getText(selection);
  const matched = pattern.exec(text);
  if (matched) {
    return new Selection(
      selection.start.with(selection.start.line, matched.index),
      selection.end.with(
        selection.start.line,
        matched.index + matched[0].length
      )
    );
  } else {
    return selection;
  }
}

export function prefixLines(text: string): Thenable<boolean> | void {
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const selection: Selection = editor.selection;
  return editor.edit((builder) => {
    for (let line = selection.start.line; line <= selection.end.line; line++) {
      builder.insert(selection.start.with(line, 0), text);
    }
  });
}

export function promptForInput(
  prompt: string,
  placeHolder?: string,
  value?: string
): Thenable<string | undefined> {
  const opts: vscode.InputBoxOptions = { prompt, value, placeHolder };
  return vscode.window.showInputBox(opts);
}

const TRUESTR = /t|true|y|yes|1/i;
function isTrueish(val?: string): boolean {
  if (!val) {
    return false;
  }
  const istrue: RegExpMatchArray | null = val.match(TRUESTR);
  return istrue !== null && istrue.length > 0;
}

export function promptForBoolean(
  prompt: string,
  placeHolder?: string,
  value?: string
): Thenable<boolean | undefined> {
  const opts: vscode.InputBoxOptions = { prompt, value, placeHolder };
  return vscode.window.showInputBox(opts).then((retval) => isTrueish(retval));
}
