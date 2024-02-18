// test-setup.ts
import MarkdownIt from "markdown-it";
import adobeMarkdownPlugin from "../../plugin/index";
import * as path from "path";

export function setupMarkdownParser(): MarkdownIt {
  // Path to the fixtures folder for the test suite.  Any relative paths in the
  // markdown files will be resolved relative to this path.  For example,
  // snippets will be in <fixturePath>/help/_includes/snippets.md;
  const fixturePath = path.join(__dirname, "../fixtures");
  const md = new MarkdownIt();
  md.use(adobeMarkdownPlugin, fixturePath);
  return md;
}
