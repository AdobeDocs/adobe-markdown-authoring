import assert from "assert";
import * as fs from "fs";
import * as path from "path";
import _ from "lodash";

import { setupMarkdownParser } from "../transforms.test";
import { before } from "mocha";
import MarkdownIt from "markdown-it";

suite("Snippet Transform Rule", () => {
  let md: MarkdownIt;
  let input: string;
  let expectedOutput: string;
  before(async () => {
    md = setupMarkdownParser(".");
  });

  test("Should render the {{premium-note}} snippet.", async () => {
    input = await fs.promises.readFile(
      path.join(__dirname, "../../fixtures/transforms/snippet-simple.md"),
      "utf-8"
    );
    expectedOutput = await fs.promises.readFile(
      path.join(__dirname, "../../fixtures/transforms/snippet-simple.html"),
      "utf-8"
    );
    const tokens = md.parse(input, {});
    const output = md.renderer.render(tokens, md.options, {});
    assert.strictEqual(
      _.replace(_.trim(output), /(\s)(?![^<]*>)/g, " "),
      _.replace(_.trim(expectedOutput), /(\s)(?![^<]*>)/g, " ")
    );
  });
});
