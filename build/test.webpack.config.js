const CopyWebpackPlugin = require('copy-webpack-plugin');
const glob = require('glob');

module.exports = {
    target: 'node',
    mode: 'none',
    externals: ["fs"],
    entry: './src/test/runTest.ts',
    resolve: {
        extensions: ['.ts', '.js']
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
