const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const Prism = require("prismjs");
const TerserPlugin = require('terser-webpack-plugin');

const prismLanguages = Object.keys(Prism.languages);

const sharedConfig = {
  target: "node",
  externals: {
    vscode: 'commonjs vscode',
    fs: 'commonjs fs',
    fsevents: 'commonjs fsevents',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.mjs'],
  },
  output: {
    libraryTarget: "commonjs2",
  },
  stats: {
    warnings: false, // Hide all warnings by default
    errors: true, // Still show errors
    warningsFilter: /Critical dependency: the request of a dependency is an expression/,
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: false,
          mangle: false,
          output: {
            beautify: true,
            comments: true,
          },
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{ loader: "ts-loader" }],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new webpack.ContextReplacementPlugin(
      /prismjs[\\/]components/,
      new RegExp(`^./(${prismLanguages.join("|")})$`, "i")
    ),
  ],
};

module.exports = sharedConfig;
