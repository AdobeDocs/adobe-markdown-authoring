const path = require('path');
const shared = require('./shared.webpack.config.js');

const previewConfig = {
    ...shared,
    entry: {
        'index': path.join(__dirname, '..', 'src', 'preview', 'index.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist', 'preview'),
        filename: '[name].bundle.js'
    },
    devtool: 'source-map'
};

module.exports = previewConfig;
