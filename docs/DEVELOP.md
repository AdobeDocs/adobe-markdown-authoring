# Developer guide for VSCode Markdown Adobe Extension

This is a major rewrite of the original VSCode Adobe Markdown Extension. Most of the improevements are
behind the scenes in consolidating several plugins into a single extension.

- Most of the extension is now coded in TypeScript.
- There is no longer an external "Adobe Markdown-it Plugin" dependency. The plugin is now part of the extension.
- The extension now uses the [Adobe Spectrum Web Components](https://opensource.adobe.com/spectrum-web-components/) for the UI.
- The extension now uses [Webpack](https://webpack.js.org/) to bundle the extension and its dependencies.
- The extension now uses [NPM](https://www.npmjs.com/) as the package manager for Node.js instead of Yarn because Webpack seems to prefer it that way.

All of the supported Adobe Flavored Markdown is described in the [Experience League Syntax Style Guide](https://experienceleague.adobe.com/docs/authoring-guide-exl/using/markdown/syntax-style-guide.html?lang=en#badges). This extension attempts to follow the syntax style guide as closely as possible.

## Prerequisites

- [Node.js](https://nodejs.org/en/) The core platform on which all VSCode extensions are built.
- [VSCode](https://code.visualstudio.com/) The editor used to develop VSCode extensions.
- [NPM](https://www.npmjs.com/) is the package manager for Node.js
- [Webpack](https://webpack.js.org/) The bundler that is used to package the extension and its dependencies.
- [Adobe Spectrum Web Components](https://opensource.adobe.com/spectrum-web-components/) The UI components used in the extension.

## Getting Started

Eventually, this extension will replace the current Adobe Markdown Extension. For now, it is a private repository hosted on the Applied Relevance GitHub account. To get started, you will need to clone the repository and install the dependencies.

```bash
git clone https://github.com/appliedrelevance/vscode-markdown-adobe.git
cd vscode-markdown-adobe
npm install
```

## How is the extension organized?

There are three main parts to the extension, each is contained in its folder.

- ./src - The extension itself
- ./src-preview - The Preview Webview web components and themes.
- ./src-rules - The Markdownlint rules for Adobe Flavored Markdown.

Each of the parts requires its build process. The Webpack configuration files are located in the "build" folder.

- plugin.webpack.config.js - Configuration for building the Markdown-it Plugin.
- preview.webpack.config.js - Configuration for building the Preview Webview.
- shared.adobe.webpack.config.js - Shared configuration for all of the builds.
- webpack.config.js - Configuration for building the extension.

## Building the Extension

The extension is built using Webpack. The build process is defined in the `webpack.config.js` file. The build process will create a `dist` folder for the extension, a `dist-plugin` folder for the Markdown-it Plugin, and a `dist-preview` folder for the Preview Webview.

```bash
npm run build
```

## Debugging the Extension

The extension can be debugged using the VSCode debugger. The debugger is configured in the `.vscode/launch.json` file. The debugger will launch a new instance of VSCode with the extension installed.

## Markdown-it Plugin

In support of the markdown preview, the extension uses the Markdown-It plug-in system to convert Adobe Flavored Markdown directives into HTML. Each markdown component is defined in its own file under the `/src-plugin/transform/` folder. The `index.ts` file is the entry point for the plugin. The `index.ts` file imports all of the components and registers them with the Markdown-it parser. The `index.ts` file also defines the `adobe` plugin. The `adobeMarkdownPlugin` plugin is the entry point for the plugin.

> This extension no longer uses the independent [Adobe Markdown-it Plugin](https://www.npmjs.com/package/markdown-it-adobe-plugin).

### Adding a new Markdown-it transformation

To add a new Markdown-it transformation, create a new file in the `/src-plugin/transform/` folder. The file should export a function that takes a single parameter, the Markdown-it parser. Register the transform function with the Markdown-it parser in the `index.ts` file.

The transform functions are registered in the order they are called. The order is important because the transforms are applied in the order they are registered. That is why, for example, the includeFileParts transform is called before the 'normalize' transform, so that it can modify the action Markdown file before it is tokenized. Each of the other transform functions modifies the `state.tokens` array directly, in the order in which they are called.

```javascript
md.core.ruler.before("normalize", "include", includeFileParts);
md.core.ruler.after("block", "tabs", transformTabs);
md.core.ruler.after("block", "shadebox", transformShadebox);
md.core.ruler.after("block", "collapsible", transformCollapsible);
md.core.ruler.after("block", "table-styles", transformTableStyles);
md.core.ruler.after("block", "tabs", transformTabs);
md.core.ruler.after("block", "dnls", transformDNLs);
md.core.ruler.after("block", "uicontrol", transformUICONTROLs);
md.core.ruler.after("block", "alert", transformAdmonitions);
md.core.ruler.after("block", "header-anchors", transformHeaderAnchors);
md.core.ruler.after("block", "link-target", transformLinkTargets);
```

#### Snippets

The extension also supports snippets and includes. The snippets and include transform functions are defined in `/src-plugin/transform/snippets.ts`.

https://experienceleague.adobe.com/docs/authoring-guide-exl/using/authoring/includes.html?lang=en

To share text among articles in a repo, you create a \_includes folder in the help folder. This \_includes folder can have .md files that can be referenced (included) from other files in the repo. In addition, a snippets.md file in this repo can include Head2 anchors that can be referenced from any file in the repo.

Reference to H2 in snippets.md file: `{{id-name}}`

Reference to include file: `{{$include /help/_includes/filename.md}}`

#### Admonitions

The extension supports admonitions. The admonition transform functions are defined in `/src-plugin/transform/admonitions.ts`. Admonitions are sometimes called "alerts" or "notes".

## Adobe Spectrum Integration

Some areas of the Experience Leagues documentation site are being migrated to the Adobe Spectrum Design System. The extension partially supports the Spectrum Design System by using the [Adobe Spectrum Web Components](https://opensource.adobe.com/spectrum-web-components/) library.

## Markdownlint Integration

The linter rules specific to Adobe are provided by Adobe. However, they are maintained in JavaScript and redundant to the rules built-in to Markdownlint. Because of this, we cannot use the rules provided by Adobe. Instead, we have to convert the rules to a format that can be used by Markdownlint. Since we are using TypeScript throughout the application, we have created TypeScript versions of all of the rules.

To ease migration, we keep a copy of the original JavaScript rules in an `src-rules/from-adobe` folder. The `from-adobe` folder is not included in the build process. The `from-adobe` folder is only used to compare the original rules to the TypeScript rules.
