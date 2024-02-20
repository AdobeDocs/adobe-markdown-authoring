const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const sharedConfig = require('./shared.webpack.config');

module.exports = {
    ...sharedConfig,
    entry: './src/test/node/runNodeTests.ts', // Assuming an entry point for node tests
    output: {
        path: path.resolve(__dirname, '../dist/test'),
        filename: 'nodeTests.bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{ loader: "ts-loader" }],
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'src/test/fixtures',
                    to: 'fixtures', // Adjust the destination to reflect the test structure
                    globOptions: {
                        ignore: [
                            '**/*.ts',
                            '**/*.js.map',
                        ],
                    },
                },
            ],
        }),
    ]
};
