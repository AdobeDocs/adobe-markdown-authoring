# Issue Analysis and Resolution Plan for Adobe Markdown Authoring

This document outlines a plan to address the current open issues in the AdobeDocs/adobe-markdown-authoring project.

## Issue #69: Adding {target="_blank"} corrupts preview

Status: Completed

### Problem Analysis

When adding `{target="_blank"}` to a link in markdown, the preview in VS Code sometimes gets corrupted, not showing images, inline code, etc. properly.

After examining the code in `src/plugin/transform/link-targets.ts`, the issue appears to be in the token manipulation process. The current implementation:

1. Uses regex to find links with target attributes
2. Creates new tokens to replace the original ones
3. Splices these tokens into the token array

The problem likely occurs because:
- The token replacement doesn't properly handle cases where the link is near other complex elements
- The regex-based approach might be too aggressive in replacing content
- The token splicing might disrupt the token stream in ways that affect rendering of nearby elements

### Proposed Solution

1. Refactor the `transformLinkTargets` function to be more robust:
   - Improve the regex pattern to be more precise and avoid capturing unrelated content
   - Add additional checks to ensure proper token handling
   - Use a more structured approach to token manipulation that preserves surrounding elements

2. The key issue appears to be in how tokens are spliced into the array, which can disrupt the token stream. Instead of replacing the entire token, we should modify the existing token structure:

```typescript
export default function transformLinkTargets(state: StateCore) {
  let tokens: Token[] = state.tokens;
  // More specific regex that won't interfere with other elements
  const targetMatch = /(?<![`*_~])\[([^\]]+)\]\(([^)]+)\)\{\s*target\s*=\s*["']?([^"'\s\}]+)["']?\s*\}/g;

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    if (token.type === TokenType.INLINE && token.children) {
      // Process each child token instead of replacing the entire inline token
      let modified = false;

      // First pass: identify if we need to modify this token
      if (token.content.match(targetMatch)) {
        // Create a new array for modified children
        const newChildren: Token[] = [];

        // Track the current position in the content
        let lastIndex = 0;
        let content = token.content;
        let match;

        // Reset regex state
        targetMatch.lastIndex = 0;

        // Process each match
        while ((match = targetMatch.exec(content)) !== null) {
          const [fullMatch, text, url, target] = match;
          const matchIndex = match.index;

          // Add text before the match
          if (matchIndex > lastIndex) {
            const beforeText = content.slice(lastIndex, matchIndex);
            if (beforeText) {
              const textToken = new Token("text", "", 0);
              textToken.content = beforeText;
              newChildren.push(textToken);
            }
          }

          // Add the link tokens
          const linkOpenToken = new Token("link_open", "a", 1);
          linkOpenToken.attrs = [
            ["href", url],
            ["target", target]
          ];

          const textToken = new Token("text", "", 0);
          textToken.content = text;

          const linkCloseToken = new Token("link_close", "a", -1);

          newChildren.push(linkOpenToken, textToken, linkCloseToken);

          // Update lastIndex
          lastIndex = matchIndex + fullMatch.length;
        }

        // Add any remaining text
        if (lastIndex < content.length) {
          const afterText = content.slice(lastIndex);
          if (afterText) {
            const textToken = new Token("text", "", 0);
            textToken.content = afterText;
            newChildren.push(textToken);
          }
        }

        // Replace children with our new array
        token.children = newChildren;

        // Update the token's content to match its children
        token.content = newChildren.map(t => t.content || '').join('');

        modified = true;
      }

      // Skip ahead if we modified this token to avoid processing it again
      if (modified) {
        continue;
      }
    }
  }
}
```

3. Add a special case to handle links that are adjacent to images or code blocks:

```typescript
// Add this function to detect and handle special cases
function isNearSpecialElement(token: Token): boolean {
  if (!token.children) return false;

  // Check if there are image or code tokens near link tokens
  for (let i = 0; i < token.children.length; i++) {
    if (token.children[i].type === 'link_open') {
      // Check nearby tokens (within 3 positions) for images or code
      const start = Math.max(0, i - 3);
      const end = Math.min(token.children.length, i + 3);

      for (let j = start; j < end; j++) {
        if (j !== i &&
            (token.children[j].type === 'image' ||
             token.children[j].type === 'code_inline')) {
          return true;
        }
      }
    }
  }

  return false;
}
```

## Issue #70: Editor creates boxes around text when combining snippets with code

Status: Completed

### Problem Analysis

When using a snippet in a markdown file followed by inline code, all text up until the code block gets a box around it. This is not causing errors but confuses and obstructs the experience.

After examining `src/plugin/transform/snippets.ts`, the issue appears to be related to how snippets are processed and integrated with the surrounding content. The current implementation:

1. Processes snippets early in the markdown processing pipeline
2. Directly manipulates the source text
3. Doesn't have specific handling for interactions with code blocks

The problem likely occurs because:
- The snippet replacement doesn't properly account for how it affects the rendering of subsequent inline code
- There might be CSS conflicts between snippet styling and code block styling
- The token structure after snippet insertion might be interpreted incorrectly by the renderer

### Implementation Details

The issue has been fixed by:

1. Adding a post-processing step in `src/plugin/transform/snippets.ts` that identifies and fixes problematic token structures when snippets are followed by inline code
2. Adding CSS rules in `assets/styles/docs.css` to prevent unwanted styling interactions between snippets and code blocks
3. Creating a test case in `src/test/suite/transforms/snippet-code-interaction.test.ts` to verify the fix

### Proposed Solution

1. Modify the snippet processing to better handle transitions to code blocks:
   - Add special handling when snippets are followed by inline code
   - Ensure proper token boundaries are maintained

2. Review and update the CSS to prevent unwanted styling interactions:
   - Add specific rules to prevent boxes around text between snippets and code
   - Ensure proper scoping of styles

3. Add a post-processing step to clean up any problematic token structures:

```typescript
// Add to snippets.ts
function cleanupSnippetCodeInteractions(state: StateCore) {
  // Identify and fix problematic token sequences
  // ...
}

export function includeFileParts(state: StateCore, rootDir?: string) {
  // Existing code...
  state.src = replaceIncludes(state.src, rootDir);
  state.src = replaceSnippets(state.src, rootDir);
  // Add cleanup step
  cleanupSnippetCodeInteractions(state);
}
```

## Issue #71: Use VSC plugin to recommend alt tag content for images

Status: In Progress

### Problem Analysis

Many images are missing alt tag content, which lowers SEO. The request is to use AI to generate missing or incomplete alt text for images.

This is a feature request rather than a bug. The current image handling in `src/plugin/transform/images.ts` processes image attributes but doesn't have functionality to suggest or generate alt text.

### Proposed Solution

1. Implement a new feature to detect images with missing or inadequate alt text:
   - Add a function to identify images without alt text or with generic alt text (e.g., "image")
   - Create a warning system to highlight these images to the user

2. Integrate with an AI service to generate alt text suggestions:
   - Add a new command to VS Code extension to request alt text suggestions
   - Implement API calls to an AI service (e.g., Azure Computer Vision or similar)
   - Present suggestions to the user for approval

3. Add a configuration option to enable/disable this feature

```typescript
// New file: src/lib/commands/suggest-alt-text.ts
import * as vscode from 'vscode';
import { getImageUrl } from '../utility';
import { callAiService } from '../ai-service';

export async function suggestAltText() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  // Find images without alt text
  // ...

  // For each image, generate suggestions
  // ...

  // Present suggestions to user
  // ...
}
```

## Issue #72: Stick to active tab in VSC preview

### Problem Analysis

When editing content within a tab in a `[!BEGINTABS] ... [!TAB Whatever..] ... [!ENDTABS]` markdown block, the preview window immediately switches to the first tab with every edit, which disrupts the authoring workflow.

After examining `src/plugin/transform/tabs.ts`, the issue is clear:
- The tabs implementation always sets the first tab as selected (`selected="1"`)
- There's no mechanism to remember which tab was active during editing
- The preview is completely regenerated on each edit, losing tab state

### Proposed Solution

1. Implement a state persistence mechanism for tabs using the VS Code extension context:
   - Create a new service to manage tab state persistence
   - Store the active tab for each document separately
   - Use the document URI as a key to track state per file

2. Modify the tabs transformer to use the persisted state:
   - Pass the current document URI to the transformer
   - Retrieve the stored tab state for this document
   - Apply the correct `selected` attribute based on this state

3. Add event listeners in the preview to update the state when tabs are clicked:

```typescript
// New file: src/lib/tab-state-service.ts
import * as vscode from 'vscode';

interface TabState {
  [documentUri: string]: string; // Maps document URI to selected tab value
}

export class TabStateService {
  private static instance: TabStateService;
  private tabState: TabState = {};

  private constructor() {}

  public static getInstance(): TabStateService {
    if (!TabStateService.instance) {
      TabStateService.instance = new TabStateService();
    }
    return TabStateService.instance;
  }

  public getSelectedTab(documentUri: string): string {
    return this.tabState[documentUri] || "1"; // Default to first tab
  }

  public setSelectedTab(documentUri: string, tabValue: string): void {
    this.tabState[documentUri] = tabValue;
    // Trigger a selective refresh of the preview
    vscode.commands.executeCommand('markdown.preview.refresh');
  }
}

// In extension.ts, initialize the service
// Add to activate function:
context.subscriptions.push(
  vscode.commands.registerCommand('markdown.setSelectedTab', (uri: string, value: string) => {
    TabStateService.getInstance().setSelectedTab(uri, value);
  })
);

// In tabs.ts
export default function transformTabs(state: StateCore, documentUri: string) {
  // Get the currently selected tab from storage
  const tabStateService = TabStateService.getInstance();
  const selectedTab = tabStateService.getSelectedTab(documentUri);

  // Existing code with modification to use selectedTab
  let newToken = new Token(TokenType.HTML_BLOCK, "", 1);
  newToken.content = `<div class="sp-wrapper"><sp-tabs
                   selected="${selectedTab}"
                   size="l"
                   direction="horizontal"
                   dir="ltr"
                   focusable=""
                   data-document-uri="${documentUri}"
                 >`;
  // ...
}

// In preview/index.ts
function setupTabStateTracking() {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'SP-TAB') {
      const value = target.getAttribute('value');
      const tabsElement = target.closest('sp-tabs');

      if (value && tabsElement) {
        const documentUri = tabsElement.getAttribute('data-document-uri');
        if (documentUri) {
          // Use VS Code API to communicate with extension
          window.postMessage({
            command: 'markdown.setSelectedTab',
            uri: documentUri,
            value: value
          }, '*');
        }
      }
    }
  });
}

// Add message listener in the extension to handle events from preview
window.addEventListener('message', event => {
  const message = event.data;
  if (message.command === 'markdown.setSelectedTab') {
    vscode.commands.executeCommand('markdown.setSelectedTab', message.uri, message.value);
  }
});
```

4. Modify the plugin initialization to pass the document URI:

```typescript
// In src/plugin/index.ts
export default function adobeMarkdownPlugin(md: MarkdownIt, filePath: string) {
  md.use(injectTransforms, filePath);
  return md;
}

function injectTransforms(md: MarkdownIt, filePath: string) {
  // ...
  md.core.ruler.after("block", "tabs", (state) => transformTabs(state, filePath));
  // ...
}
```

## Issue #73: Handlebars language confuses the preview

### Problem Analysis

VS Code Preview becomes confused when using Handlebars language, whether indicated as `handlebars` for a code block or when using Handlebars inside an HTML code block.

This issue is likely related to how the markdown parser and syntax highlighter handle Handlebars syntax, which uses curly braces (`{{` and `}}`) that might conflict with other markdown extensions or custom syntax in the Adobe Markdown Authoring plugin.

The specific problem could be:
- Handlebars syntax being interpreted as snippet syntax (which also uses `{{` and `}}`)
- Conflicts in syntax highlighting rules
- Issues with escaping special characters in code blocks

### Proposed Solution

1. Update the snippet regex pattern to be more specific and avoid conflicts with Handlebars syntax:

```typescript
// In snippets.ts - update the regex to specifically exclude code blocks
const SNIPPET_RE: RegExp = /(?<!```[\s\S]*?)(?<!`)(?<!\\\{\{)\{\{([^{}]+)\}\}(?!`)(?![\s\S]*?```)/i;
```

2. Add a preprocessing step to protect code blocks before snippet processing:

```typescript
// New function in snippets.ts
function protectCodeBlocks(src: string): { protected: string, blocks: string[] } {
  const codeBlocks: string[] = [];
  const fencePattern = /```(?:handlebars|html)?\n([\s\S]*?)```/g;

  // Replace code blocks with placeholders
  const protectedSrc = src.replace(fencePattern, (match, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(match);
    return placeholder;
  });

  return { protected: protectedSrc, blocks: codeBlocks };
}

function restoreCodeBlocks(src: string, blocks: string[]): string {
  let result = src;
  for (let i = 0; i < blocks.length; i++) {
    result = result.replace(`__CODE_BLOCK_${i}__`, blocks[i]);
  }
  return result;
}

export function includeFileParts(state: StateCore, rootDir?: string) {
  if (typeof rootDir !== "string") {
    console.warn("Warning: includeFileParts was called without a valid rootDir.");
    return;
  }

  // Protect code blocks before processing
  const { protected: protectedSrc, blocks: codeBlocks } = protectCodeBlocks(state.src);
  state.src = protectedSrc;

  // Process includes and snippets
  state.src = replaceIncludes(state.src, rootDir);
  state.src = replaceSnippets(state.src, rootDir);

  // Restore protected code blocks
  state.src = restoreCodeBlocks(state.src, codeBlocks);
}
```

3. Add special handling for inline Handlebars syntax within HTML code blocks:

```typescript
// Additional function to handle inline Handlebars
function handleInlineHandlebars(state: StateCore): void {
  // Find HTML code blocks with Handlebars syntax
  const htmlBlockPattern = /<([\w-]+)(?:\s+[^>]*?)?\{\{.*?\}\}(?:[^>]*?)?>.*?<\/\1>/g;

  // Process each match to ensure proper rendering
  state.src = state.src.replace(htmlBlockPattern, (match) => {
    // Escape the handlebars syntax in a way that won't affect rendering
    // but will prevent it from being processed as a snippet
    return match.replace(/\{\{/g, '\\{\\{').replace(/\}\}/g, '\\}\\}');
  });
}

// Add this to the includeFileParts function
export function includeFileParts(state: StateCore, rootDir?: string) {
  // Existing code...

  // Add special handling for inline Handlebars
  handleInlineHandlebars(state);

  // Protect code blocks before processing
  const { protected: protectedSrc, blocks: codeBlocks } = protectCodeBlocks(state.src);
  state.src = protectedSrc;

  // Rest of the function...
}
```

4. Add a custom renderer for Handlebars code blocks to ensure proper syntax highlighting:

```typescript
// In plugin/index.ts
function injectTransforms(md: MarkdownIt, filePath: string) {
  // Add custom renderer for handlebars code blocks
  const originalFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];
    if (token.info === 'handlebars') {
      // Apply special handling for handlebars code blocks
      const content = token.content;
      // Render with proper escaping to prevent interference with other transforms
      return `<pre class="language-handlebars"><code>${md.utils.escapeHtml(content)}</code></pre>`;
    }
    return originalFence(tokens, idx, options, env, slf);
  };

  // Rest of the function...
}
```

## Implementation Timeline

### Week 1: Address Issues #69 and #73 (High Priority)

#### Days 1-2: Issue #69 (Link Targets)
- Implement the improved `transformLinkTargets` function with more precise regex
- Add special handling for links near images and code blocks
- Create test cases that reproduce the corruption issue
- Test with various combinations of links and other elements

#### Days 3-5: Issue #73 (Handlebars)
- Implement code block protection mechanism
- Update snippet regex to avoid conflicts with Handlebars syntax
- Add custom renderer for Handlebars code blocks
- Test with various Handlebars templates in different contexts

### Week 2: Address Issue #72 (Tab State Persistence)

#### Days 1-2: Design and Implementation
- Create the TabStateService class
- Modify the tabs transformer to use persisted state
- Update plugin initialization to pass document URI

#### Days 3-4: Preview Integration
- Implement event listeners in preview
- Add message passing between preview and extension
- Test tab state persistence across edits

#### Day 5: Testing and Refinement
- Test with complex documents containing multiple tab sets
- Ensure state is properly maintained during editing
- Fix any edge cases discovered during testing

### Week 3: Address Issue #70 (Snippet and Code Interactions)

#### Days 1-2: Analysis and Design
- Create reproducible test cases for the issue
- Analyze token structure when snippets are followed by code
- Design solution to prevent unwanted styling

#### Days 3-4: Implementation
- Modify snippet processing to handle transitions to code blocks
- Update CSS to prevent unwanted styling interactions
- Add post-processing cleanup step

#### Day 5: Testing
- Test with various snippet and code combinations
- Ensure no visual artifacts or unwanted boxes appear
- Verify that existing snippet functionality works correctly

### Week 4: Implement Issue #71 (Alt Text Suggestions)

#### Days 1-2: AI Service Integration
- Research available AI services for image analysis
- Implement API client for the selected service
- Create test harness for the API integration

#### Days 3-4: VS Code Extension Integration
- Implement command to detect images without alt text
- Create UI for presenting suggestions to the user
- Add configuration options for the feature

#### Day 5: Documentation and Final Testing
- Document the new feature in README and CHANGELOG
- Create usage examples and best practices
- Perform end-to-end testing with real-world documents

## Testing Strategy

### Automated Testing

1. **Unit Tests**:
   - Create specific test cases for each issue in `src/test/suite/`
   - Test each component in isolation with mocked dependencies
   - Verify edge cases and error handling

2. **Integration Tests**:
   - Test the complete markdown processing pipeline
   - Verify interactions between different transformers
   - Ensure fixes don't cause regressions in other features

3. **Regression Tests**:
   - Create a comprehensive test suite covering all existing functionality
   - Run regression tests after each fix to ensure no new issues are introduced
   - Automate tests to run on CI/CD pipeline

### Manual Testing

1. **Issue #69 (Link Targets)**:
   - Test with links containing various target values
   - Test links adjacent to images, code blocks, and other complex elements
   - Verify preview renders correctly in all cases

2. **Issue #70 (Snippet and Code)**:
   - Test snippets followed by inline code in various contexts
   - Verify no unwanted boxes appear around text
   - Test with nested snippets and complex layouts

3. **Issue #72 (Tab State)**:
   - Test editing content within different tabs
   - Verify tab state persists across edits
   - Test with multiple tab sets in a single document
   - Test with very large documents containing many tabs

4. **Issue #73 (Handlebars)**:
   - Test Handlebars syntax in dedicated code blocks
   - Test Handlebars within HTML code blocks
   - Verify preview renders correctly without corruption
   - Test with complex Handlebars templates

5. **Issue #71 (Alt Text)**:
   - Test detection of missing alt text
   - Verify quality of AI-generated suggestions
   - Test user interface for reviewing and accepting suggestions
   - Test with various image types and contexts

## Documentation Updates

1. **CHANGELOG.md**:
   - Add detailed entries for each fixed issue
   - Include version number and release date
   - Provide links to the original issue reports

2. **README.md**:
   - Update features section to include alt text suggestions
   - Add usage examples for the new feature
   - Update any screenshots or demos

3. **User Guide**:
   - Create or update documentation for the alt text suggestion feature
   - Add best practices for using target attributes in links
   - Update information about Handlebars support
   - Document tab behavior changes

4. **Developer Documentation**:
   - Update `DEVELOP.md` with information about the new code structure
   - Document the tab state persistence mechanism
   - Add notes about the code block protection system