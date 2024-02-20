// plugin.webpack.config.js

const path = require('path');
const shared = require('./shared.webpack.config');

module.exports = {
    ...shared,
    target: 'node',
    entry: {
        'plugin': path.join(__dirname, '..', 'src', 'plugin', 'index.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist', 'standalone'),
        filename: 'markdown-it-adobe-plugin.js',
        libraryTarget: 'commonjs2',
    },
    externals: {
        'fs': 'commonjs fs',
        'path': 'commonjs path'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        fallback: {
            // No fallback needed as we're targeting node
        }
    }
};
