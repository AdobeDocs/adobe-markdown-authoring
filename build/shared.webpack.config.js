// ESM imports
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";
import Prism from "prismjs";

const prismLanguages = Object.keys(Prism.languages);

// Configuration object
const sharedConfig = {
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

// ESM export
export default sharedConfig;
