import assert from "assert";

import { setupMarkdownParser } from "../transforms.test";
import { before } from "mocha";
import MarkdownIt from "markdown-it";

suite("Transform Link Targets Rule", () => {
  let md: MarkdownIt;
  before(() => {
    md = setupMarkdownParser(".");
  });

  test("should add target attribute to links with target attribute defined in braces", () => {
    const input = "[Link](http://example.com){target=_blank}";
    const expectedOutput = `<p>\n<a href="http://example.com" target="_blank">Link</a></p>\n`;
    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    assert.strictEqual(output, expectedOutput);
  });

  test("should not add target attribute to links without target attribute defined in braces", () => {
    const input = "[Link](http://example.com)";
    const expectedOutput = `<p><a href="http://example.com">Link</a></p>\n`;
    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    assert.strictEqual(output, expectedOutput);
  });
});
