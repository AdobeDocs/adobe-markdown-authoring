import * as vscode from "vscode";
import {
  Selection,
  TextEditor,
  TextDocument,
  Range,
  Position,
  TextEditorEdit,
} from "vscode";

export function replaceSelection(
  replaceFunc: (text: string) => string
): Thenable<boolean> {
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return Promise.resolve(false);
  }
  const selection: Selection = editor.selection;

  var newText: string = replaceFunc(editor.document.getText(selection));
  return editor.edit((edit) => edit.replace(selection, newText));
}

export function replaceBlockSelection(
  replaceFunc: (text: string) => string
): Thenable<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return Promise.resolve(false);
  }
  const selection = getBlockSelection();
  if (!selection) {
    return Promise.reject("No Selection to replace.");
  }

  const newText = replaceFunc(editor.document.getText(selection));
  return editor
    .edit((edit) => edit.replace(selection, newText))
    .then((success) => {
      const newSelection = getBlockSelection();
      if (newSelection) {
        editor.selection = newSelection;
      }
      return success;
    });
}

export function isAnythingSelected(): boolean {
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;
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
    const selEnd = new Position(
      endPatternPosition.line,
      endPatternPosition.character + endPattern.length
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

function getParagraphSelection(
  editor: TextEditor,
  selection: Selection
): Selection {
  const doc = editor.document;
  const cursorPosition = selection.active;
  let startLine = cursorPosition.line;
  while (startLine >= 0 && isLineBlank(doc.lineAt(startLine).text)) startLine--;
  let endLine = cursorPosition.line;
  while (endLine < doc.lineCount && isLineBlank(doc.lineAt(endLine).text))
    endLine++;
  return startLine >= 0 && endLine < doc.lineCount
    ? new Selection(
        new Position(startLine, 0),
        new Position(endLine, doc.lineAt(endLine).text.length)
      )
    : new Selection(cursorPosition, cursorPosition);
}

function isLineBlank(line: string): boolean {
  return /^\s*$/.test(line);
}

export function getSurroundingPattern(
  editor: TextEditor,
  selection: Selection,
  pattern?: RegExp
): Selection | void {
  const line: vscode.TextLine = editor.document.lineAt(selection.active);
  const matched: RegExpExecArray | null | undefined = pattern?.exec(line.text);

  if (matched) {
    const selStart = new Position(line.lineNumber, matched.index);
    const selEnd = new Position(
      line.lineNumber,
      matched.index + matched[0].length
    );
    return new Selection(selStart, selEnd);
  } else {
    return;
  }
}

export function getSurroundingWord(
  editor: TextEditor,
  selection: Selection,
  wordPattern?: RegExp
): Selection | void {
  var range: Range | undefined = editor.document.getWordRangeAtPosition(
    selection.active,
    wordPattern
  );
  if (range === undefined) {
    return;
  } else {
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
  if (endPattern === undefined || endPattern === null) {
    endPattern = startPattern;
  }

  const editor: TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return Promise.reject("No Text Editor is Defined");
  }
  let selection: void | Selection = getBlockSelection();
  if (!selection) {
    return Promise.reject("No selection is available");
  }

  // Nothing is selected, so try to find something to toggle.
  if (!isAnythingSelected()) {
    // If the cursor is in a markdown block, select the block, otherwise return
    // a zero-length selection at the cursor position.
    var withSurroundingWord: Selection | void = getSurroundingBlock(
      editor,
      selection,
      startPattern,
      endPattern
    );

    // Select the block
    if (withSurroundingWord) {
      selection = editor.selection = withSurroundingWord;
    }
  }

  //
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

export function getBlockSelection(): Selection | void {
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const selection: Selection = editor.selection;

  if (selection.isEmpty) {
    return selection;
  }

  return new Selection(
    selection.start.with(undefined, 0),
    selection.end.with(selection.end.line + 1, 0)
  );
}

export function getLineSelection(): Selection | void {
  const editor: TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const selection: Selection = editor.selection;

  const endchar = editor.document.lineAt(selection.start.line).range.end
    .character;
  return new Selection(
    selection.start.with(selection.start.line, 0),
    selection.end.with(selection.start.line, endchar)
  );
}

export function isBlockMatch(startPattern: RegExp): boolean {
  const selection: void | Selection = getBlockSelection();
  if (!selection) {
    return false;
  }
  return isSelectionMatch(selection, startPattern);
}

export function isMatch(startPattern: RegExp): boolean {
  const editor: TextEditor | void = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }
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
