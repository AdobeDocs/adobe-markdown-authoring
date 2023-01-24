import assert from "assert";

import { setupMarkdownParser } from "../transforms.test";
import { before } from "mocha";
import MarkdownIt from "markdown-it";

suite("Collapsible Transform Rule", () => {
  let md: MarkdownIt;
  before(() => {
    md = setupMarkdownParser(".");
  });

  test("should convert +++ to <details> and </details> with <summary>", () => {
    const input = "+++ Title\nContent\n+++";
    const expectedOutput =
      "<details>\n<summary>Title</summary>\nContent\n</details>\n";
    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    assert.strictEqual(output, expectedOutput);
  });
});
