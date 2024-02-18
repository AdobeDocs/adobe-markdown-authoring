import assert from "assert";

import { setupMarkdownParser } from "../transforms.helper";
import { before } from "mocha";
import MarkdownIt from "markdown-it";

suite("DNL Transform Rule", () => {
  let md: MarkdownIt;
  before(() => {
    md = setupMarkdownParser();
  });

  test("should strip the [!DNL <text>] markdown and leave the <text> part", () => {
    const input = "Lorem ipsum [!DNL dolor sit amet]";
    const expectedOutput = "<p>Lorem ipsum dolor sit amet</p>\n";
    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    assert.strictEqual(output, expectedOutput);
  });
});
