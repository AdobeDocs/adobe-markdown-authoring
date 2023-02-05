import assert from "assert";
import * as fs from "fs";
import * as path from "path";

import { setupMarkdownParser } from "../transforms.test";
import { before } from "mocha";
import MarkdownIt from "markdown-it";

suite("TABS Transform Rule", () => {
  let md: MarkdownIt;
  let input: string;
  let expectedOutput: string;
  before(async () => {
    md = setupMarkdownParser(".");
    input = await fs.promises.readFile(
      path.join(__dirname, "../../fixtures/tabs-simple.md"),
      "utf-8"
    );
    expectedOutput = await fs.promises.readFile(
      path.join(__dirname, "../../fixtures/tabs-simple.html"),
      "utf-8"
    );
  });

  test("Simple Tabs", () => {
    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    console.log(output);
    assert.strictEqual(output, expectedOutput);
  });
});
