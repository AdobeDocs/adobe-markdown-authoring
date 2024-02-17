// ESM imports
import path from 'path';
import { fileURLToPath } from 'url';
import shared from './shared.webpack.config.js'; // Make sure this is an ESM module

// Deriving __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration object
const pluginConfig = {
    ...shared,
    target: 'node',
    entry: {
        'plugin': path.join(__dirname, '..', 'src', 'plugin', 'index.ts'),
    },
    output: {
        path: path.join(__dirname, '..', 'dist', 'standalone'),
        filename: 'markdown-it-adobe-plugin.js',
        library: {
            name: 'Plugin',
            type: 'commonjs2',
        },
    },
    externals: {
        'fs': 'commonjs fs',
        'path': 'commonjs path'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.mjs'],
        // Ensure fallback settings are correct for your project's needs
    }
};

// ESM export
export default pluginConfig;
