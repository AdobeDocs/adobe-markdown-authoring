// ESM imports
import path from 'path';
import { fileURLToPath } from 'url';
import shared from './shared.webpack.config.js'; // Adjusted to use ESM import

// Deriving __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration object
const rulesConfig = {
    ...shared,
    target: 'node',
    entry: {
        'index': path.join(__dirname, '..', 'src', 'rules', 'rules.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist', 'rules'),
        filename: 'rules.bundle.js',
        libraryTarget: "commonjs2"
    },
    devtool: 'source-map'
};

// ESM export
export default rulesConfig;
