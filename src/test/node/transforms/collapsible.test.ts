import assert from "assert";

import { setupMarkdownParser } from "../transforms.helper";
import { before } from "mocha";
import MarkdownIt from "markdown-it";
import { normalizeHtml } from "../../utils";
import * as fs from "fs";
import * as path from "path";

suite("Collapsible Transform Rule", () => {
  let md: MarkdownIt;
  before(() => {
    md = setupMarkdownParser();
  });

  test("should convert +++ to <details> and </details> with <summary>", () => {
    const input = "+++ Title\nContent\n\n+++\n";
    const expectedOutput =
      "<details><summary>Title</summary><p>Content</p></details>";
    // try {
    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    assert.strictEqual(output, expectedOutput);
    // } catch (e) {
    //   console.log(e);
    // }
  });

  test("should convert +++ to <details> and </details> with <summary> and <p>", async () => {
    const input = await fs.promises.readFile(
      path.join(__dirname, "../../fixtures/transforms/collapsible-simple.md"),
      "utf-8"
    );
    const expectedOutput = await fs.promises.readFile(
      path.join(__dirname, "../../fixtures/transforms/collapsible-simple.html"),
      "utf-8"
    );

    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    assert.strictEqual(normalizeHtml(output), normalizeHtml(expectedOutput));
  });
});
