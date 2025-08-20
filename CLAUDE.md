# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Adobe Markdown Authoring extension for Visual Studio Code - a comprehensive extension that enhances VS Code's built-in Markdown preview with Adobe-specific Markdown syntax extensions. The extension supports Adobe Flavored Markdown as specified in the Adobe Experience League documentation.

## Development Commands

### Building and Testing
- `npm run build` - Full build including preview, rules, extension, and plugin components
- `npm run rebuild` - Clean and full rebuild
- `npm run test` - Run test suite (requires building first)
- `npm run package` - Create production build with source maps
- `npm run clean` - Remove dist directory

### Component-Specific Builds
- `npm run build-preview` - Build preview webview components
- `npm run build-rules` - Build custom markdownlint rules
- `npm run build-ext` - Build main extension
- `npm run build-plugin` - Build markdown-it plugin
- `npm run compile` - TypeScript compilation only

### Testing and Linting
- `npm run lint` - Run ESLint on TypeScript files
- `npm run test-lint` - Test markdownlint rules on README
- `npm run vsce:package` - Create .vsix package for distribution

### Development Build Without Plugin
- `npm run build-no-plugin` - Build without markdown-it plugin (for faster development)

## Architecture Overview

### Core Components
The extension is organized into three main parts, each in its own folder:

1. **Extension Core** (`src/extension.ts`) - Main VS Code extension entry point
2. **Markdown-it Plugin** (`src/plugin/`) - Custom markdown processing
3. **Markdownlint Rules** (`src/rules/`) - Adobe-specific linting rules
4. **Preview Components** (`src/preview/`) - Webview preview enhancements

### Key Source Structure
- `src/lib/commands.ts` - All markdown shortcut commands registration
- `src/lib/commands/` - Individual command implementations
- `src/plugin/transform/` - Markdown transformation functions
- `src/controllers/` - Lint configuration management
- `src/rules/rules/` - Custom AM### markdownlint rules

### Build System
Uses Webpack with separate configurations in `build/` folder:
- `ext.webpack.config.js` - Main extension build
- `plugin.webpack.config.js` - Markdown-it plugin build
- `preview.webpack.config.js` - Preview webview build
- `rules.webpack.config.js` - Markdownlint rules build

## Adobe Flavored Markdown Features

The extension supports Adobe's custom markdown syntax including:
- **Admonitions**: `>[!NOTE]`, `>[!TIP]`, `>[!CAUTION]`, `>[!WARNING]`, `>[!IMPORTANT]`, etc.
- **Shadeboxes**: `>[!BEGINSHADEBOX]` ... `>[!ENDSHADEBOX]`
- **Video embeds**: `>[!VIDEO](url)`
- **UI elements**: `[!UICONTROL text]`, `[!DNL text]`
- **Snippets and includes**: `{{$include /path/to/file}}`, `{{snippet-id}}`
- **Enhanced tables, tabs, collapsible sections**

## Testing

The project uses Mocha with TypeScript for testing. Tests are located in `src/test/` and include:
- Command functionality tests (`src/test/suite/shortcuts/`)
- Transform function tests (`src/test/suite/transforms/`)
- AI alt-text suggestion tests (`src/test/suite/commands/`)

Test fixtures are in `src/test/fixtures/` for testing markdown transformations.

## Configuration

### TypeScript Configuration
- Base config: `tsconfig.base.json`
- Component-specific configs in each major folder
- Target: ES2020, strict mode enabled

### Markdownlint Integration
The extension includes custom AM### rules specific to Adobe Flavored Markdown in addition to standard MD### rules. Configuration is managed automatically by the extension.

## Key Implementation Notes

### Plugin Transform Order
Transforms are applied in specific order in `src/plugin/index.ts`:
1. Snippets/includes (before tokenization)
2. Single newlines, highlights, shadeboxes
3. Badge processing, link targets, table styles
4. DNL, UICONTROL, admonitions, tabs
5. Header anchors, collapsible sections
6. Image processing (after tokenization)

### Command Registration
All markdown shortcuts are registered through `src/lib/commands.ts` with consistent pattern. Each command has a corresponding implementation in `src/lib/commands/toggle-*.ts`.

### AI Integration
The extension includes AI-powered alt text suggestion functionality in `src/lib/ai-service.ts` and `src/lib/commands/suggest-alt-text.ts`.

## Development Workflow

1. Make changes to source files
2. Run `npm run build` to build all components
3. Test in VS Code using F5 (Extension Development Host)
4. Run `npm run test` for automated testing
5. Run `npm run lint` to check code quality
6. Use `npm run package` for production builds