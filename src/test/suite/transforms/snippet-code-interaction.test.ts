import * as assert from "assert";
import * as path from "path";
import * as fs from "fs";
import { setupMarkdownParser } from "../transforms.test";
import { normalizeHtml } from "../../utils";

suite("Snippet Code Interaction Transform Tests", () => {
  const fixturesPath = path.resolve(__dirname, "../../fixtures/transforms");

  test("Snippet followed by inline code should not create unwanted boxes", async () => {
    const md = setupMarkdownParser();
    const mdPath = path.join(fixturesPath, "snippet-code-issue.md");
    const mdContent = fs.readFileSync(mdPath, "utf8");

    // Render the markdown
    const html = md.render(mdContent);

    // Verify that the rendered HTML doesn't have unwanted styling
    // The text after the snippet and before the inline code should not be wrapped in a box
    assert.ok(
      html.includes(
        "<p>This is text after the snippet. When followed by inline code like <code>code example</code>"
      ),
      "Text after snippet and before inline code should be properly formatted"
    );

    // Verify that there's proper spacing between the snippet and the following paragraph
    assert.ok(
      html.includes("</div>\n<p>"),
      "There should be proper spacing between the snippet and the following paragraph"
    );
  });
});
