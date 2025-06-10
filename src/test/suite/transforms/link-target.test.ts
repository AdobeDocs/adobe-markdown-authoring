import assert from "assert";

import { setupMarkdownParser } from "../transforms.test";
import { before } from "mocha";
import MarkdownIt from "markdown-it";

suite("Transform Link Targets Rule", () => {
  let md: MarkdownIt;
  before(() => {
    md = setupMarkdownParser();
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

  test("should handle links with target attributes near other elements", () => {
    // Link near image
    const inputWithImage =
      "![Image](http://example.com/image.png)\n[Link](http://example.com){target=_blank}";
    const tokensWithImage = md.parse(inputWithImage, {});
    const outputWithImage = md.renderer.render(tokensWithImage, md.options, {});
    assert.ok(
      outputWithImage.includes(
        '<img src="http://example.com/image.png" alt="Image">'
      ),
      "Image should be rendered correctly"
    );
    assert.ok(
      outputWithImage.includes(
        '<a href="http://example.com" target="_blank">Link</a>'
      ),
      "Link with target should be rendered correctly"
    );

    // Link near code block
    const inputWithCode =
      "```js\nconsole.log('test');\n```\n[Link](http://example.com){target=_blank}";
    const tokensWithCode = md.parse(inputWithCode, {});
    const outputWithCode = md.renderer.render(tokensWithCode, md.options, {});
    assert.ok(
      outputWithCode.includes('<pre><code class="language-js">'),
      "Code block should be rendered correctly"
    );
    assert.ok(
      outputWithCode.includes(
        '<a href="http://example.com" target="_blank">Link</a>'
      ),
      "Link with target should be rendered correctly"
    );

    // Link near inline code
    const inputWithInlineCode =
      "`inline code` [Link](http://example.com){target=_blank}";
    const tokensWithInlineCode = md.parse(inputWithInlineCode, {});
    const outputWithInlineCode = md.renderer.render(
      tokensWithInlineCode,
      md.options,
      {}
    );
    assert.ok(
      outputWithInlineCode.includes("<code>inline code</code>"),
      "Inline code should be rendered correctly"
    );
    assert.ok(
      outputWithInlineCode.includes(
        '<a href="http://example.com" target="_blank">Link</a>'
      ),
      "Link with target should be rendered correctly"
    );
  });
});
