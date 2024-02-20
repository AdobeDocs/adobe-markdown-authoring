const MarkdownIt = require('markdown-it');
const adobePlugin = require('../../dist/standalone/markdown-it-adobe-plugin.js').default;

const md = new MarkdownIt({ html: true });

md.use(adobePlugin); // Simplified plugin for testing

console.log(md.render('# Markdown with Adobe Plugin'));
