import * as assert from "assert";
import * as vscode from "vscode";

const setEditorContent = async (
  content: string
): Promise<vscode.TextEditor> => {
  const document = await vscode.workspace.openTextDocument({
    content,
    language: "markdown",
  });

  const editor = await vscode.window.showTextDocument(document);
  return editor;
};

const updateSelection = (
  editor: vscode.TextEditor,
  startPosition: vscode.Position,
  endPosition: vscode.Position
) => {
  const selection = new vscode.Selection(startPosition, endPosition);
  editor.selection = selection;
};

const extractPositionsFromContent = (content: string) => {
  const anchorStart = "«";
  const anchorEnd = "»";
  const activeStart = "≤";
  const activeEnd = "≥";

  const anchorStartIndex = content.indexOf(anchorStart);
  const anchorEndIndex = content.indexOf(anchorEnd);
  const activeStartIndex = content.indexOf(activeStart);
  const activeEndIndex = content.indexOf(activeEnd);

  const startPosition = new vscode.Position(
    content.substring(0, anchorStartIndex).split("\n").length - 1,
    anchorStartIndex -
      content.substring(0, anchorStartIndex).lastIndexOf("\n") -
      1
  );
  const endPosition = new vscode.Position(
    content.substring(0, activeEndIndex).split("\n").length - 1,
    activeEndIndex - content.substring(0, activeEndIndex).lastIndexOf("\n") - 1
  );

  const cleanContent = content
    .replace(anchorStart, "")
    .replace(anchorEnd, "")
    .replace(activeStart, "")
    .replace(activeEnd, "");

  return { startPosition, endPosition, cleanContent };
};

export const testCommand = async (
  command: string,
  inputContentWithMarkers: string,
  expectedContent: string
): Promise<void> => {
  const { startPosition, endPosition, cleanContent } =
    extractPositionsFromContent(inputContentWithMarkers);

  const editor = await setEditorContent(cleanContent);
  updateSelection(editor, startPosition, endPosition);

  await vscode.commands.executeCommand("md-shortcut." + command);
  const resultContent = editor.document.getText();

  try {
    assert.strictEqual(resultContent, expectedContent);
  } finally {
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  }
};
