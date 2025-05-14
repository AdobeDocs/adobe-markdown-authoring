import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { suggestAltText } from "../../../lib/commands/suggest-alt-text";
import * as aiService from "../../../lib/ai-service";

suite("Suggest Alt Text Command Tests", () => {
  let sandbox: sinon.SinonSandbox;
  let showErrorMessageStub: sinon.SinonStub;
  let showInformationMessageStub: sinon.SinonStub;
  let isAiServiceConfiguredStub: sinon.SinonStub;
  let generateAltTextStub: sinon.SinonStub;
  let activeTextEditorStub: sinon.SinonStub;

  setup(() => {
    sandbox = sinon.createSandbox();

    // Stub VS Code API methods
    showErrorMessageStub = sandbox
      .stub(vscode.window, "showErrorMessage")
      .resolves(undefined);
    showInformationMessageStub = sandbox
      .stub(vscode.window, "showInformationMessage")
      .resolves(undefined);

    // Stub AI service methods
    isAiServiceConfiguredStub = sandbox.stub(
      aiService,
      "isAiServiceConfigured"
    );
    generateAltTextStub = sandbox.stub(aiService, "generateAltText");

    // Stub active text editor
    activeTextEditorStub = sandbox.stub(vscode.window, "activeTextEditor");
  });

  teardown(() => {
    sandbox.restore();
  });

  test("Should show error when no active editor", async () => {
    // Set up the stub to return undefined (no active editor)
    activeTextEditorStub.value(undefined);

    await suggestAltText();

    assert.strictEqual(showErrorMessageStub.calledOnce, true);
    assert.strictEqual(
      showErrorMessageStub.firstCall.args[0],
      "No active editor found"
    );
  });

  test("Should show error when AI service is not configured", async () => {
    // Set up stubs
    activeTextEditorStub.value({
      document: {
        getText: () => "Some markdown content",
        uri: vscode.Uri.file("/test/document.md"),
        positionAt: (offset: number) => new vscode.Position(0, offset),
        languageId: "markdown",
      },
      edit: sandbox.stub().resolves(true),
    });
    isAiServiceConfiguredStub.returns(false);

    // Configure showErrorMessageStub to return a specific value
    showErrorMessageStub.resolves(undefined);

    await suggestAltText();

    assert.strictEqual(showErrorMessageStub.calledOnce, true);
    assert.strictEqual(
      showErrorMessageStub.firstCall.args[0],
      "AI service for alt text generation is not configured. Please configure it in settings."
    );
  });

  test("Should show info message when no images with inadequate alt text are found", async () => {
    // Set up stubs
    activeTextEditorStub.value({
      document: {
        getText: () => "Some markdown content without images",
        uri: vscode.Uri.file("/test/document.md"),
        positionAt: (offset: number) => new vscode.Position(0, offset),
        languageId: "markdown",
      },
      edit: sandbox.stub().resolves(true),
    });
    isAiServiceConfiguredStub.returns(true);

    await suggestAltText();

    assert.strictEqual(showInformationMessageStub.calledOnce, true);
    assert.strictEqual(
      showInformationMessageStub.firstCall.args[0],
      "No images with missing or inadequate alt text found"
    );
  });

  test("Should process images with inadequate alt text", async () => {
    // Set up stubs
    const documentText =
      "Here is an image: ![](image.jpg) and another image: ![short](pic.png)";
    const editStub = sandbox.stub().resolves(true);

    activeTextEditorStub.value({
      document: {
        getText: () => documentText,
        uri: vscode.Uri.file("/test/document.md"),
        positionAt: (offset: number) => new vscode.Position(0, offset),
        languageId: "markdown",
      },
      edit: editStub,
    });

    isAiServiceConfiguredStub.returns(true);
    generateAltTextStub.resolves("Generated alt text");

    // Mock the progress API
    const progressStub = sandbox
      .stub(vscode.window, "withProgress")
      .callsFake(
        async (
          options: vscode.ProgressOptions,
          task: (
            progress: vscode.Progress<{ message?: string; increment?: number }>,
            token: vscode.CancellationToken
          ) => Thenable<unknown>
        ) => {
          return await task(
            { report: sandbox.stub() },
            {
              isCancellationRequested: false,
              onCancellationRequested: sandbox
                .stub()
                .returns({ dispose: sandbox.stub() }),
            }
          );
        }
      );

    // Mock the showInformationMessage to simulate user clicking "Apply"
    showInformationMessageStub.resolves("Apply");

    await suggestAltText();

    // Verify that generateAltText was called for both images
    assert.strictEqual(generateAltTextStub.callCount, 2);

    // Verify that edit was called to apply the alt text
    assert.strictEqual(editStub.callCount, 2);

    // Verify final message
    assert.strictEqual(
      showInformationMessageStub.lastCall.args[0],
      "Processed 2 images"
    );
  });
});
