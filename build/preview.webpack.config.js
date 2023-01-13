const path = require('path');
const shared = require('./shared.webpack.config');

module.exports = {
    ...shared,
    target: 'web',
    entry: {
        'index': path.join(__dirname, '..', 'src-preview', 'index.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist-preview'),
        filename: '[name].bundle.js'
    },
    devtool: 'source-map'
};