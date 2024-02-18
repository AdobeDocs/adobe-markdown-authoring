// @ts-check
const path = require('path');
const shared = require('./shared.webpack.config.js'); // Import shared config

// Extension-specific configuration
const extensionConfig = {
  // Entry and output paths specific to the extension
  entry: { extension: './src/extension.ts' },
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: 'extension.js',
  },
  externals: {
    vscode: 'commonjs vscode',
  },
};

// Merge with shared configuration and export
module.exports = [
  {
    ...shared,
    ...extensionConfig,
  },
];
