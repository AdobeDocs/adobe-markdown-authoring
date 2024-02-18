const path = require('path');
const sharedConfig = require('./shared.webpack.config');

module.exports = {
    ...sharedConfig,
    entry: './src/test/electron/runElectronTests.ts',
    output: {
        path: path.resolve(__dirname, '../dist/test'),
        filename: 'electronTests.bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{ loader: "ts-loader" }],
            },
        ],
    }
};
