const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const Prism = require("prismjs");
require("prismjs/components/index"); // Import all language components

const prismLanguages = Object.keys(Prism.languages);

module.exports = {
  target: "web",
  externals: ["fs"],
  resolve: {
    extensions: [".ts", ".js"],
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
