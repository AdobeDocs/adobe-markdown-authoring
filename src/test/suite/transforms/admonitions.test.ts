import assert from "assert";

import { setupMarkdownParser } from "../transforms.test";
import { before, after } from "mocha";
import MarkdownIt from "markdown-it";
import * as vscode from "vscode";

suite("Admonition Transform Rule", () => {
  let md: MarkdownIt;
  before(() => {
    md = setupMarkdownParser(".");
  });
  after(() => {
    vscode.window.showInformationMessage("Admonition Test Done.");
  });
  test('should convert [!NOTE] to <div class="Admonition note" data-label="NOTE">', () => {
    const input = "> [!NOTE]\n>\n> This is note text.";
    const expectedOutput =
      '<div class="extension note" data-label="NOTE">\n<div class="p"></div>\n<div class="p">This is note text.</div>\n</div>\n';
    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    assert.strictEqual(output, expectedOutput);
  });
});
