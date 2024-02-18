const path = require('path');
const shared = require('./shared.webpack.config.js'); // Adjust this path as needed

const pluginConfig = {
    ...shared,
    entry: {
        'plugin': path.join(__dirname, '..', 'src', 'plugin', 'index.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist', 'standalone'),
        filename: 'markdown-it-adobe-plugin.js',
        library: {
            name: 'Plugin',
            type: 'commonjs2',
        },
    },
    externals: {
        'fs': 'commonjs fs',
        'path': 'commonjs path'
    }
};

module.exports = pluginConfig;
