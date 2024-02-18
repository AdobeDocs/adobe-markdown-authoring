const path = require('path');
const shared = require('./shared.webpack.config.js'); // Make sure this path is correct

const rulesConfig = {
    ...shared,
    entry: {
        'index': path.join(__dirname, '..', 'src', 'rules', 'rules.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist', 'rules'),
        filename: 'rules.bundle.js',
        libraryTarget: "commonjs2"
    },
    devtool: 'source-map'
};

module.exports = rulesConfig;
