// test-setup.ts
import MarkdownIt from "markdown-it";
import adobeMarkdownPlugin from "../../plugin/index";
import * as adobeMarkdownExtension from "../../extension";

export function setupMarkdownParser(filePath: string): MarkdownIt {
  const ext = adobeMarkdownExtension;
  const md = new MarkdownIt();
  md.use(adobeMarkdownPlugin, filePath);
  return md;
}
