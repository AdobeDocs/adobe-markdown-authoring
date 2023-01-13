import MarkdownIt, { Options } from "markdown-it";
import { transformAdmonitions } from "./transform/admonitions";
import { transformCollapsible } from "./transform/collapsible";
import { transformDNLs } from "./transform/dnls";
import { transformHeaderAnchors } from "./transform/header-anchors";
import transformLinkTargets from "./transform/link-targets";
import { transformShadebox } from "./transform/shadebox";
import { includeFileParts } from "./transform/snippets";
import { transformTableStyles } from "./transform/table-styles";
import transformTabs from "./transform/tabs";
import { transformUICONTROLs } from "./transform/uicontrols";

export enum TokenType {
    BLOCKQUOTE_OPEN = "blockquote_open",
    BLOCKQUOTE_CLOSE = "blockquote_close",
    HTML_BLOCK = "html_block",
    PARAGRAPH_OPEN = "paragraph_open",
    PARAGRAPH_CLOSE = "paragraph_close",
    INLINE = "inline",
    HEADING_OPEN = "heading_open",
    TABLE_OPEN = "table_open",
    TABLE_CLOSE = "table_close",
}

export default function adobeMarkdownPlugin(
    md: MarkdownIt, filePath: string) {
    md.use(injectTransforms, filePath);
    return md;
}

function injectTransforms(md: MarkdownIt, filePath: string) {
    // Process the snippets first because they operate directly on the Markdown source instead of the tokens.
    md.core.ruler.before('normalize', 'include', (state) => { includeFileParts(state, filePath); });
    // Now add the token transforms.
    md.core.ruler.after('block', 'tabs', transformTabs);
    md.core.ruler.after('block', 'shadebox', transformShadebox);
    md.core.ruler.after('block', 'collapsible', transformCollapsible);
    md.core.ruler.after('block', 'table-styles', transformTableStyles);
    md.core.ruler.after('block', 'tabs', transformTabs);
    md.core.ruler.after('block', 'dnls', transformDNLs);
    md.core.ruler.after('block', 'uicontrol', transformUICONTROLs);
    md.core.ruler.after('block', 'alert', transformAdmonitions);
    md.core.ruler.after('block', 'header-anchors', transformHeaderAnchors);
    md.core.ruler.after('block', 'link-target', transformLinkTargets);
}

