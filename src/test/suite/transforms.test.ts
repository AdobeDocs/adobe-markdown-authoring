// test-setup.ts
import MarkdownIt from "markdown-it";
import adobeMarkdownPlugin from "../../plugin/index";

export function setupMarkdownParser(filePath: string): MarkdownIt {
  const md = new MarkdownIt();
  md.use(adobeMarkdownPlugin, filePath);
  return md;
}
