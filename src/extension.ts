import * as vscode from "vscode";
import MarkdownIt from "markdown-it";
import Prism from "prismjs";
import "prismjs/components/index.js"; // Load all supported languages

import adobeMarkdownPlugin from "./plugin";
import {
  checkMarkdownlintCustomProperty,
  checkMarkdownlintConfigSettings,
} from "./controllers/lint-config-controller";
import { generateTimestamp, output } from "./lib/common";
import { register } from "./lib/commands";
import { findAndReplaceTargetExpressions, getRootFolder } from "./lib/utiity";

const spectrumConfigSection = "markdown-spectrum";
/**
 * Activates the extension and registers event listeners and functions to enable various functionalities.
 * @param {vscode.ExtensionContext} context - The context of the extension.
 */
export function activate(context: vscode.ExtensionContext) {
  var extensionPath: string = context.extensionPath;
  const { msTimeValue } = generateTimestamp();
  output.appendLine(
    `[${msTimeValue}] - Activating Adobe Flavored Markdown extension at ${extensionPath}`
  );

  output.appendLine(`[${msTimeValue}] - Activating docs linting extension.`);
  // Markdown Lint custom rule check
  checkMarkdownlintCustomProperty();
  // Markdown Lint config check
  checkMarkdownlintConfigSettings();

  // Markdown Shortcuts
  function buildLanguageRegex(): RegExp {
    const languageArray: string[] | undefined = vscode.workspace
      .getConfiguration("markdown")
      .get("languages") || ["markdown"];
    return new RegExp("(" + languageArray.join("|") + ")");
  }

  function togglemarkdown(langId: string) {
    vscode.commands.executeCommand(
      "setContext",
      "markdown:enabled",
      languageRegex.test(langId)
    );
  }

  // Execute on activate
  let languageRegex = buildLanguageRegex();
  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    togglemarkdown(activeEditor.document.languageId);
  }

  // Update languageRegex if the configuration changes
  vscode.workspace.onDidChangeConfiguration(
    (configChange) => {
      if (configChange.affectsConfiguration("markdown.languages")) {
        languageRegex = buildLanguageRegex();
      }
    },
    null,
    context.subscriptions
  );

  // Enable/disable markdown
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (activeEditor) {
        togglemarkdown(activeEditor.document.languageId);
      }
    },
    null,
    context.subscriptions
  );

  // When the document changes, find and replace target expressions (for example, smart quotes).
  vscode.workspace.onDidChangeTextDocument(findAndReplaceTargetExpressions);

  // Triggered with language id change
  vscode.workspace.onDidOpenTextDocument(
    (document) => {
      if (activeEditor && activeEditor.document === document) {
        togglemarkdown(activeEditor.document.languageId);
      }
    },
    null,
    context.subscriptions
  );

  register(context);
  output.appendLine(`[${msTimeValue}] - Registered markdown shortcuts`);

  console.log('Activated extension "vscode-markdown-adobe"');
  // Extend MarkdownIt to process Adobe Flavored Markdown to HTML for preview.
  return {
    extendMarkdownIt(md: MarkdownIt) {
      md = adobeMarkdownPlugin(md, getRootFolder()?.uri.path || extensionPath);
      md.use(injectSpectrumTheme).set({
        highlight: function (str: string, lang: string, attrs: any) {
          if (lang && Prism.languages[lang]) {
            try {
              return Prism.highlight(str, Prism.languages[lang], lang);
            } catch (__) {}
          }
          return ""; // use external default escaping
        },
      });

      md.renderer.rules.fence = (
        tokens: any[],
        idx: number,
        options: object,
        env: object,
        slf: object
      ) => {
        return customFenceRenderer(tokens, idx, options, env, slf, md);
      };
      return md;
    },
  };
}

/**
 * This function is called when the extension is deactivated.
 */
export function deactivate() {}

// The default Spectrum theme to use if no valid theme is found
const defaultSpectrumTheme = "dark";

// An array of valid Spectrum themes
const validSpectrumThemes = ["lightest", "light", "dark", "darkest"];

/**
 * Sanitizes a Spectrum theme by checking if it is a string and if it is a valid theme.
 * If the theme is not a string or is not a valid theme, the default theme is returned.
 * @param {string|undefined} theme - The Spectrum theme to sanitize.
 * @returns {string} - The sanitized Spectrum theme.
 */
function sanitizeSpectrumTheme(theme: string | undefined): string {
  // Check if the theme is a string and if it is a valid theme
  if (typeof theme === "string" && validSpectrumThemes.includes(theme)) {
    // If the theme is valid, return it
    return theme;
  } else {
    // If the theme is not valid, return the default theme
    return defaultSpectrumTheme;
  }
}

/**
 * Injects Spectrum theme settings into the Markdown preview.
 * @param {any} md - The Markdown renderer instance.
 * @returns {any} - The modified Markdown renderer instance.
 */
function injectSpectrumTheme(md: any): any {
  // Get the original render function from the Markdown renderer
  const render = md.renderer.render;

  // Override the render function to inject Spectrum theme settings
  md.renderer.render = function () {
    // Get the Spectrum theme configurations from settings.json
    const darkModeTheme = sanitizeSpectrumTheme(
      vscode.workspace
        .getConfiguration(spectrumConfigSection)
        .get("darkModeTheme")
    );
    const lightModeTheme = sanitizeSpectrumTheme(
      vscode.workspace
        .getConfiguration(spectrumConfigSection)
        .get("lightModeTheme")
    );

    // Inject the Spectrum theme settings into the Markdown preview.
    return `<sp-theme id="${spectrumConfigSection}"
		theme="spectrum"
		color="light"
		scale="medium" aria-hidden="true"
    data-dark-mode-theme="${darkModeTheme}"
    data-light-mode-theme="${lightModeTheme}">
    <div id="app">
      <div data-id="main">
        <div data-id="body">
          ${render.apply(md.renderer, arguments)}
        </div>
      </div>
    </div>
  </sp-theme>`;
  };

  // Return the modified Markdown renderer instance
  return md;
}

/**
 * Extracts and returns lineNumberRows and preClass from langAttrs and code.
 * @param {string} langAttrs - Language attributes
 * @param {string} code - Code block content
 * @returns {{lineNumberRows: string, preClass: string, startLine: number}}
 */
function processLineNumbersAndHighlights(
  langAttrs: string,
  code: string
): {
  lineNumberRows: string;
  preClass: string;
  startLine: number;
  highlightLines: string[];
} {
  let lineNumberRows = "";
  let preClass = "";

  const startLineAttr = /start-line=["'](\d+)["']/.exec(langAttrs);
  const startLine = startLineAttr ? parseInt(startLineAttr[1]) : 1;

  let highlightLines: string[] = [];

  if (langAttrs) {
    const lineNumbersAttr = /line-numbers=["']true["']/.test(langAttrs);
    const highlightAttr =
      /highlight=["']((\d+(-\d+)?)(,\s*\d+(-\d+)?)*)["']/.exec(
        langAttrs.replace(/[{}]/g, "")
      );
    const highlightValue = highlightAttr ? highlightAttr[1] : "";
    highlightLines = Array.from(highlightValue.matchAll(/\d+(-\d+)?/g)).map(
      (match) => match[0]
    );

    if (lineNumbersAttr) {
      preClass = "line-numbers";
      const numberOfLines = code.split("\n").length - 1;
      lineNumberRows = `<span aria-hidden="true" class="line-numbers-rows">`;
      for (let i = 0; i < numberOfLines; i++) {
        lineNumberRows += "<span></span>";
      }
      lineNumberRows += "</span>";
    }

    preClass += ` language-html" data-start="${startLine}"`;
    if (highlightLines.length) {
      preClass += ` data-line="${highlightLines.join(", ")}"`;
    }
  }

  return { lineNumberRows, preClass, startLine, highlightLines };
}

function generateLineHighlights(
  highlightLines: string[],
  startLine: number
): string {
  const lineRanges = highlightLines.map((range) =>
    range.split("-").map(Number)
  );
  return lineRanges
    .map(
      ([start, end]) =>
        `<div aria-hidden="true" data-range="${start}-${
          end || start
        }" class=" line-highlight" style="top: ${
          (start - startLine) * 24 + 2
        }px; height: ${((end || start) - start + 1) * 24}px;"></div>`
    )
    .join("");
}

/**
 * Overrides fence renderer for code blocks with line numbering, line highlighting, and starting line number.
 * @param {Array} tokens - Tokens
 * @param {number} idx - Index
 * @param {Object} options - Options
 * @param {Object} env - Environment
 * @param {Object} slf - Self
 * @param {MarkdownIt} md - MarkdownIt instance
 * @returns {string} - Rendered HTML
 */
function customFenceRenderer(
  tokens: Array<any>,
  idx: number,
  options: object,
  env: object,
  slf: object,
  md: MarkdownIt
): string {
  const token = tokens[idx];
  const langInfo = token.info.trim();
  const langAttrs = langInfo.match(/{[^}]+}/)?.[0] || "";

  let code = token.content;

  const { lineNumberRows, preClass, startLine, highlightLines } =
    processLineNumbersAndHighlights(langAttrs, code);

  const langName = token.info ? token.info.split(/\s+/g)[0] : "text";
  const highlightedCode = md.options.highlight(code, langName, langAttrs);

  const lineHighlights = generateLineHighlights(highlightLines, startLine);

  return `<div class="code-toolbar"><pre class="${preClass}" tabindex="0" style="counter-reset: linenumber ${
    startLine - 1
  };"><code class="${langName}">${highlightedCode}${lineNumberRows}</code>${lineHighlights}</pre></div>`;
}
