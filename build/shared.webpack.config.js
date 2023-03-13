const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const glob = require('glob');

module.exports = {
  target: "web",
  externals: ["fs"],
  resolve: {
    extensions: [".ts", ".js"], // support ts-files and js-files
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
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),

  ]
};
