import assert from "assert";

import { setupMarkdownParser } from "../transforms.test";
import MarkdownIt from "markdown-it";

suite("Admonition Transform Rule", () => {
  let md: MarkdownIt;
  beforeEach(() => {
    md = setupMarkdownParser(".");
  });
  test('should convert [!NOTE] to <div class="Admonition note" data-label="NOTE">', () => {
    const input = "> [!NOTE]\n>\n> This is note text.";
    const expectedOutput =
      '<div class="Admonition note" data-label="NOTE">\n<div class="p"></div>\n<div class="p">This is note text.</div>\n</div>';
    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    assert.strictEqual(output, expectedOutput);
  });
});
