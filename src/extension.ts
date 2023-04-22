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
      // Custom fence renderer for code blocks with line numbering, line highlighting, and starting line number
      let plugin = adobeMarkdownPlugin(
        md,
        getRootFolder()?.uri.path || extensionPath
      );
      md.use(injectSpectrumTheme);
      md.set({
        highlight: function (str, lang, attrs) {
          if (lang && Prism.languages[lang]) {
            try {
              return Prism.highlight(str, Prism.languages[lang], lang);
            } catch (__) {}
          }

          return ""; // use external default escaping
        },
      });

      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        const langInfo = token.info.trim();
        const langAttrs = langInfo.match(/{[^}]+}/)?.[0] || "";

        let code = token.content;

        let lineNumberRows = "";
        let preClass = "";
        const startLineAttr = /start-line="(\d+)"/.exec(langAttrs);
        const startLine = startLineAttr ? parseInt(startLineAttr[1]) : 1;

        if (langAttrs) {
          const lineNumbersAttr = /line-numbers="true"/.test(langAttrs);
          const highlightLinesAttr = /highlight="([\d,-]+)"/.exec(langAttrs);
          const highlightLines = highlightLinesAttr
            ? highlightLinesAttr[1]
            : "";

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
          if (highlightLines) {
            preClass += ` data-line="${highlightLines}"`;
          }
        }

        const langName = token.info ? token.info.split(/\s+/g)[0] : "";
        const highlightedCode = md.options.highlight(code, langName, langAttrs);

        return `<div class="code-toolbar"><pre class="${preClass}" tabindex="0" style="counter-reset: linenumber ${
          startLine - 1
        };"><code class="${langName}">${highlightedCode}${lineNumberRows}</code></pre></div>`;
      };

      return plugin;
    },
  };
}

// This method is called when your extension is deactivated
export function deactivate() {}

const defaultSpectrumTheme = "dark";
const validSpectrumThemes = ["lightest", "light", "dark", "darkest"];

function sanitizeSpectrumTheme(theme: string | undefined) {
  return typeof theme === "string" && validSpectrumThemes.includes(theme)
    ? theme
    : defaultSpectrumTheme;
}

function injectSpectrumTheme(md: any) {
  const render = md.renderer.render;
  md.renderer.render = function () {
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
    return `<sp-theme id="${spectrumConfigSection}"
					theme="spectrum"
					color="light"
					scale="medium" aria-hidden="true"
                    data-dark-mode-theme="${darkModeTheme}"
                    data-light-mode-theme="${lightModeTheme}"></span>
                ${render.apply(md.renderer, arguments)}`;
  };
  return md;
}
