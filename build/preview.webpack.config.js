// Importing necessary modules using ESM syntax
import path from 'path';
import { fileURLToPath } from 'url';
import shared from './shared.webpack.config.js';

// Deriving __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Exporting configuration as an ECMAScript module
export default {
    ...shared,
    target: 'web',
    entry: {
        'index': path.join(__dirname, '..', 'src', 'preview', 'index.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist', 'preview'),
        filename: '[name].bundle.js'
    },
    devtool: 'source-map'
};
