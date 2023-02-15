import assert from "assert";
import { setupMarkdownParser } from "../transforms.test";
import { before } from "mocha";
import MarkdownIt from "markdown-it";

suite("Transform Header Anchors", () => {
  let md: MarkdownIt;
  before(() => {
    md = setupMarkdownParser();
  });

  test("should convert AFM Markdown header anchor to an element id on H1", () => {
    const input = "# Header {#my-header}\nContent\n";
    const expectedOutput = '<h1 id="my-header">Header </h1>\n<p>Content</p>\n';
    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    assert.strictEqual(output, expectedOutput);
  });
});
