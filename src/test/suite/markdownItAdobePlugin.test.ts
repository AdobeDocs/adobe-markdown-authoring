const MarkdownIt = require('markdown-it');
const adobePlugin = require('../../releases/markdown-it-adobe-plugin.js');
const expect = require('chai').expect;

describe('Adobe Markdown-It Plugin', function() {
  it('should apply plugin without errors', function() {
    const md = new MarkdownIt({ html: true });
    expect(() => md.use(adobePlugin)).not.to.throw();
  });

  // Additional test cases to verify the plugin's functionality
});
