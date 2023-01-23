import * as assert from 'assert';
import markdownIt from 'markdown-it';
import * as mocha from 'mocha';

const { beforeEach } = mocha;

suite('Markdown-it Transformation Rules', () => {
    let md: markdownIt;
    beforeEach(() => {
        md = new markdownIt();
    });

    test('should transform h1 headers', () => {
        const input = '# Header 1';
        const expectedOutput = '<h1>Header 1</h1>\n';
        assert.equal(md.render(input), expectedOutput);
    });

    test('should handle multiple instances of [!DNL <text>]', () => {
        const input = '[!DNL This text should not be localized] and [!DNL neither should this]';
        const expectedOutput = 'This text should not be localized and neither should this';
        assert.equal(md.render(input), expectedOutput);
    });
});