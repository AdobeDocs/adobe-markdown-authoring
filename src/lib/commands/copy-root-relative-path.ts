import * as vscode from "vscode";
import * as path from "path";

export function copyRootRelativePath(uri: vscode.Uri) {
  const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

  if (rootPath && uri) {
    const relativePath = path.relative(rootPath, uri.fsPath);
    const rootRelativePath = `/${relativePath}`;
    vscode.env.clipboard.writeText(rootRelativePath);
    vscode.window.showInformationMessage(
      `Copied root relative path: ${rootRelativePath}`
    );
  } else {
    vscode.window.showErrorMessage(
      "No root path found for the current workspace."
    );
  }
}
