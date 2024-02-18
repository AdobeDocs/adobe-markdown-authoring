import assert from "assert";
import MarkdownIt from "markdown-it";
import standalonePlugin from "../../plugin/index";

// Define a function that encapsulates your test suite
export function pluginTestSuite() {
  describe("Standalone Adobe Markdown-It Plugin", function () {
    let md: MarkdownIt;

    before(() => {
      md = new MarkdownIt({ html: true });
      md.use(standalonePlugin);
    });

    it("should load and apply the plugin without errors", function () {
      // This test might be too simplistic since it only tests if the plugin can be applied without throwing an error.
      // Consider adding more detailed assertions here if needed.
    });

    it("should render basic Markdown syntax without errors", function () {
      const input = "**bold text**";
      const expectedOutput = "<p><strong>bold text</strong></p>\n"; // Note the newline character at the end, which is usually added by MarkdownIt
      const actualOutput = md.render(input);
      assert.strictEqual(actualOutput, expectedOutput);
    });
  });
}
