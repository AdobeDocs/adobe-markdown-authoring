import assert from "assert";

import { setupMarkdownParser } from "../transforms.test";
import { before } from "mocha";
import MarkdownIt from "markdown-it";

suite("Admonition Transform Rule", () => {
  let md: MarkdownIt;
  before(() => {
    md = setupMarkdownParser();
  });

  const alertTypes = [
    "ADMINISTRATION",
    "AVAILABILITY",
    "CAUTION",
    "ERROR",
    "IMPORTANT",
    "INFO",
    // "MORELIKETHIS",  // MORELIKETHIS is not really an admonition, so we don't test it here
    "NOTE",
    "PREREQUISITES",
    "SUCCESS",
    "TIP",
    "WARNING",
  ];

  for (const alertType of alertTypes) {
    test(`should convert [!${alertType}] to <div class="extension ${alertType.toLowerCase()}" data-label="${alertType}">`, () => {
      const input = `> [!${alertType}]\n>\n> This is ${alertType.toLowerCase()} text.`;
      const expectedOutput = `<div class="extension ${alertType.toLowerCase()}" data-label="${alertType}">\n<div class="p"></div>\n<div class="p">This is ${alertType.toLowerCase()} text.</div>\n</div>\n`;
      const tokens = md.parse(input, {});
      const output = md.renderer.render(tokens, md.options, {});
      assert.strictEqual(output, expectedOutput);
    });
  }
});
