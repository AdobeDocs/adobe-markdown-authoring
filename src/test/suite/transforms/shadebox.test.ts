import assert from "assert";
import { setupMarkdownParser } from "../transforms.test";
import { before } from "mocha";
import MarkdownIt from "markdown-it";

suite("Test transformShadeBox", () => {
  let md: MarkdownIt;
  before(() => {
    md = setupMarkdownParser(".");
  });

  test("Test shadebox with title", () => {
    const input =
      '> [!BEGINSHADEBOX "title"]\n\n' +
      "This is some content in the shadebox.\n\n" +
      "> [!ENDSHADEBOX]\n";
    const expectedOutput =
      '<div class="sp-wrapper"><p><strong>title</strong></p><p>This is some content in the shadebox.</p>\n</div>';
    const output = md.render(input);
    assert.strictEqual(output, expectedOutput);
  });

  test("Test multiple shadebox with title", () => {
    const input =
      '> [!BEGINSHADEBOX "title1"]\n\n' +
      "This is some content in the shadebox 1.\n\n" +
      ">[!ENDSHADEBOX]\n\n" +
      '> [!BEGINSHADEBOX "title2"]\n\n' +
      "This is some content in the shadebox 2.\n" +
      "> [!ENDSHADEBOX]\n";
    const expectedOutput =
      '<div class="sp-wrapper"><p><strong>title1</strong></p><p>This is some content in the shadebox 1.</p>\n</div>' +
      '<div class="sp-wrapper"><p><strong>title2</strong></p><p>This is some content in the shadebox 2.</p>\n</div>';
    const output = md.render(input);
    assert.strictEqual(output, expectedOutput);
  });

  test("Test shadebox without title", () => {
    const input =
      "> [!BEGINSHADEBOX]\n\n" +
      "This is some content in the shadebox, but there is no title.\n\n" +
      "> [!ENDSHADEBOX]\n";
    const expectedOutput =
      '<div class="sp-wrapper"><p><strong></strong></p><p>This is some content in the shadebox, but there is no title.</p>\n</div>';
    const output = md.render(input);
    assert.strictEqual(output, expectedOutput);
  });

  test("A complicated shadebox with images, links, and code blocks", () => {
    const input =
      "> [!BEGINSHADEBOX]\n\n" +
      "This is some content in the shadebox, but there is no title.\n" +
      "![alt text]( https://www.example.com/image.png )\n" +
      "[link]( https://www.example.com/link )\n" +
      "```javascript\n" +
      'console.log("Testing a shadebox");\n' +
      "```\n" +
      "> [!ENDSHADEBOX]\n";
    const expectedOutput =
      '<div class="sp-wrapper"><p><strong></strong></p><p>This is some content in the shadebox, but there is no title.\n' +
      '<img src="https://www.example.com/image.png" alt="alt text">\n' +
      '<a href="https://www.example.com/link">link</a></p>\n' +
      '<pre><code class="language-javascript">console.log(&quot;Testing a shadebox&quot;);\n</code></pre>\n' +
      "</div>";
    const output = md.render(input);
    assert.strictEqual(output, expectedOutput);
  });
});
