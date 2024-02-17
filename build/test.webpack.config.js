const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');


module.exports = {
    target: 'node',
    mode: 'none',
    externals: {
        fs: 'commonjs fs',
    },
    entry: './src/test/runTest.ts',
    output: {
        path: path.resolve(__dirname, '../dist/test'),
        filename: 'runTest.bundle.js',
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto'
            },
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
                    to: 'test/fixtures',
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
