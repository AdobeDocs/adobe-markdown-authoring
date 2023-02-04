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
    const input = `> [!BEGINSHADEBOX "title"]
> This is some content in the shadebox.
> [!ENDSHADEBOX]`;
    const expectedOutput =
      '<div class="sp-wrapper"><p><strong>title</strong></p><div>This is some content in the shadebox.\n</div></div>';
    const output = md.render(input);
    assert.strictEqual(output, expectedOutput);
  });

  test("Test multiple shadebox with title", () => {
    const input = `> [!BEGINSHADEBOX "title1"]
> This is some content in the shadebox 1.
> [!ENDSHADEBOX]

> [!BEGINSHADEBOX "title2"]
> This is some content in the shadebox 2.
> [!ENDSHADEBOX]`;
    const expectedOutput =
      '<div class="sp-wrapper"><p><strong>title1</strong></p><div>This is some content in the shadebox 1.\n</div></div>' +
      '<div class="sp-wrapper"><p><strong>title2</strong></p><div>This is some content in the shadebox 2.\n</div></div>';
    const output = md.render(input);
    assert.strictEqual(output, expectedOutput);
  });

  test("Test shadebox without title", () => {
    const input = `> [!BEGINSHADEBOX]
> This is some content in the shadebox, but there is no title.
> [!ENDSHADEBOX]`;
    const expectedOutput =
      '<div class="sp-wrapper"><p><strong></strong></p><div>This is some content in the shadebox, but there is no title.\n</div></div>';
    const output = md.render(input);
    assert.strictEqual(output, expectedOutput);
  });
});
