# Developer Documentation for `markdown-it-adobe-plugin`

## Overview

The `markdown-it-adobe-plugin` is a plugin designed for the Markdown-it library. It is part of a larger VSCode extension, specifically the Adobe Markdown Authoring extension, but can also be used as a standalone module in Node.js and similar applications.

## Table of Contents

- [Getting the Plugin](#getting-the-plugin)
- [Integrating the Plugin](#integrating-the-plugin)
  - [In a Node.js Application](#in-a-nodejs-application)
  - [In a Web Application](#in-a-web-application)
- [Usage](#usage)

## Getting the Plugin

The plugin is not hosted as a separate package on NPM or a standalone GitHub repository. Instead, it is available under the `releases` folder in the main GitHub repository of the Adobe Markdown Authoring extension.

1. Navigate to the GitHub repository for the Adobe Markdown Authoring extension.
2. Go to the `releases` folder.
3. Download `markdown-it-adobe-plugin.js`.

Alternatively, you can use `curl` or a similar tool to download the file directly:

```bash
curl -O https://github.com/your-org/adobe-markdown-authoring/raw/main/releases/markdown-it-adobe-plugin.js
```

## Integrating the Plugin

### In a Node.js Application

1. Place the downloaded `markdown-it-adobe-plugin.js` file in your project directory.
2. Import the plugin and Markdown-it:

    ```javascript
    const MarkdownIt = require('markdown-it');
    const markdownItAdobePlugin = require('./path/to/markdown-it-adobe-plugin');
    ```

3. Initialize Markdown-it and use the plugin:

    ```javascript
    const md = new MarkdownIt();
    md.use(markdownItAdobePlugin);
    ```

### In a Web Application

1. Add the Markdown-it library and the plugin to your HTML:

    ```html
    <script src="path/to/markdown-it.min.js"></script>
    <script src="path/to/markdown-it-adobe-plugin.js"></script>
    ```

2. Initialize Markdown-it and use the plugin:

    ```javascript
    const md = window.markdownit();
    md.use(window.markdownItAdobePlugin);
    ```

## Usage

Once the plugin is incorporated, you can use it as you would use Markdown-it.

```javascript
const result = md.render('# Markdown Text');
```

For any Adobe-specific features, refer to the plugin's API documentation.
