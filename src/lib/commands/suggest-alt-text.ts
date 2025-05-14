import * as vscode from "vscode";
import * as path from "path";
import { generateAltText, isAiServiceConfigured } from "../ai-service";

/**
 * Regular expression to find markdown image syntax
 * Captures:
 * - Group 1: Alt text (if any)
 * - Group 2: Image URL
 */
const IMAGE_REGEX = /!\[(.*?)\]\(([^)]+)\)/g;

/**
 * Check if alt text is missing or inadequate
 * @param altText The alt text to check
 * @returns True if the alt text is missing or inadequate, false otherwise
 */
function isAltTextInadequate(altText: string): boolean {
  if (!altText || altText.trim() === "") {
    return true;
  }

  // Check for generic alt text
  const genericTerms = [
    "image",
    "picture",
    "photo",
    "screenshot",
    "img",
    "pic",
  ];
  const normalizedAlt = altText.toLowerCase().trim();

  if (genericTerms.includes(normalizedAlt)) {
    return true;
  }

  // Check if alt text is too short (less than 5 characters)
  if (normalizedAlt.length < 5) {
    return true;
  }

  return false;
}

/**
 * Find images with missing or inadequate alt text in the current document
 * @param document The document to search
 * @returns An array of objects containing the image match, range, and current alt text
 */
async function findImagesWithInadequateAltText(
  document: vscode.TextDocument
): Promise<
  Array<{
    match: RegExpExecArray;
    range: vscode.Range;
    altText: string;
  }>
> {
  const text = document.getText();
  const results = [];

  let match;
  IMAGE_REGEX.lastIndex = 0;

  while ((match = IMAGE_REGEX.exec(text)) !== null) {
    const altText = match[1] || "";

    if (isAltTextInadequate(altText)) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      const range = new vscode.Range(startPos, endPos);

      results.push({
        match,
        range,
        altText,
      });
    }
  }

  return results;
}

/**
 * Generate alt text suggestions for an image
 * @param imageUrl The URL of the image
 * @param documentUri The URI of the document containing the image
 * @returns A promise that resolves to the generated alt text
 */
async function generateAltTextSuggestion(
  imageUrl: string,
  documentUri: vscode.Uri
): Promise<string> {
  try {
    // If the image URL is relative, resolve it against the document URI
    let resolvedImageUrl = imageUrl;
    if (!imageUrl.startsWith("http") && !imageUrl.startsWith("data:")) {
      const documentDir = path.dirname(documentUri.fsPath);
      const imagePath = path.resolve(documentDir, imageUrl);
      resolvedImageUrl = vscode.Uri.file(imagePath).toString();
    }

    return await generateAltText(resolvedImageUrl);
  } catch (error) {
    console.error("Error generating alt text suggestion:", error);
    throw error;
  }
}

/**
 * Apply the selected alt text to the image
 * @param editor The text editor
 * @param range The range of the image in the document
 * @param match The regex match for the image
 * @param newAltText The new alt text to apply
 */
function applyAltText(
  editor: vscode.TextEditor,
  range: vscode.Range,
  match: RegExpExecArray,
  newAltText: string
): void {
  const originalText = match[0];
  const imageUrl = match[2];
  const newText = `![${newAltText}](${imageUrl})`;

  editor.edit((editBuilder) => {
    editBuilder.replace(range, newText);
  });
}

/**
 * Command to suggest alt text for images in the current document
 */
export async function suggestAltText() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor found");
    return;
  }

  // Check if AI service is configured
  if (!isAiServiceConfigured()) {
    const configureNow = "Configure Now";
    const response = await vscode.window.showErrorMessage(
      "AI service for alt text generation is not configured. Please configure it in settings.",
      configureNow
    );

    if (response === configureNow) {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "adobeMarkdownAuthoring.aiService"
      );
    }
    return;
  }

  const document = editor.document;

  // Find images with missing or inadequate alt text
  const imagesWithInadequateAltText = await findImagesWithInadequateAltText(
    document
  );

  if (imagesWithInadequateAltText.length === 0) {
    vscode.window.showInformationMessage(
      "No images with missing or inadequate alt text found"
    );
    return;
  }

  // Show progress indicator
  vscode.window
    .withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Generating alt text suggestions...",
        cancellable: true,
      },
      async (progress, token) => {
        try {
          let processedCount = 0;

          for (const { match, range, altText } of imagesWithInadequateAltText) {
            if (token.isCancellationRequested) {
              break;
            }

            const imageUrl = match[2];
            progress.report({
              message: `Processing image ${processedCount + 1} of ${
                imagesWithInadequateAltText.length
              }`,
              increment: (1 / imagesWithInadequateAltText.length) * 100,
            });

            try {
              const suggestion = await generateAltTextSuggestion(
                imageUrl,
                document.uri
              );

              // Ask user if they want to apply the suggestion
              const currentAlt = altText || "(none)";
              const applyText = "Apply";
              const editText = "Edit";
              const skipText = "Skip";

              const response = await vscode.window.showInformationMessage(
                `Image: ${imageUrl}\nCurrent alt text: ${currentAlt}\nSuggested alt text: ${suggestion}`,
                applyText,
                editText,
                skipText
              );

              if (response === applyText) {
                applyAltText(editor, range, match, suggestion);
              } else if (response === editText) {
                const userInput = await vscode.window.showInputBox({
                  prompt: "Edit alt text",
                  value: suggestion,
                });

                if (userInput !== undefined) {
                  applyAltText(editor, range, match, userInput);
                }
              }
              // Skip if user selects 'Skip' or dismisses the dialog
            } catch (error) {
              vscode.window.showErrorMessage(
                `Failed to generate alt text for image: ${error.message}`
              );
            }

            processedCount++;
          }

          return processedCount;
        } catch (error) {
          vscode.window.showErrorMessage(
            `Error processing images: ${error.message}`
          );
          return 0;
        }
      }
    )
    .then((processedCount) => {
      if (processedCount > 0) {
        vscode.window.showInformationMessage(
          `Processed ${processedCount} images`
        );
      }
    });
}
