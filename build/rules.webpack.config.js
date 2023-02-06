const path = require('path');
const shared = require('./shared.webpack.config');

module.exports = {
    ...shared,
    target: 'node',
    entry: {
        'index': path.join(__dirname, '..', 'src', 'rules', 'rules.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist', 'rules'),
        filename: 'rules.bundle.js',
        "libraryTarget": "commonjs2"
    },
    devtool: 'source-map'
};