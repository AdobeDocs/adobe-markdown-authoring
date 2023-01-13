# Bundling and distributing the Adobe Markdown Authoring Extension

To bundle and distribute a custom VSCode extension project, you can use the `vsce` command-line tool.

Here are the steps you can follow:

1.  Install the `vsce` package globally by running `npm install -g @vscode/vsce` in the command line.

2.  From the root of your extension project, run `vsce package` to create a `.vsix` file, which is the file format for distributing VSCode extensions. This file contains all of the files necessary for your extension to run.

3.  You can then upload the `.vsix` file to the Visual Studio Code Marketplace for others to download and install, or you can distribute it directly to other users.

4.  Alternatively you can also use `vsce publish` command to publish the extension directly to the marketplace. This will require you to have a publisher account.

5.  Once you've published the extension, users will be able to search for it and install it directly from the Visual Studio Code marketplace.

6.  You can also share the extension privately by using the `vsce create-publisher` and then use `vsce create-token` to create a token and then share the token with your team members so they can easily install the extension.

It's always recommended to keep your extension up to date. You can use `vsce update` command to update your package.

You can also use following command to check the package version `vsce show <publisher>.<extension>`.

It's also a good practice to keep your extension updated, fix any bugs and make sure it's compatible with the latest version of vscode.

## Installing a .vsix file

You can load a .vsix extension into your local Visual Studio Code (VSCode) by following these steps:

1.  Open VSCode.

2.  Click on the Extensions button on the left sidebar or press `Ctrl+Shift+X` (`Cmd+Shift+X` on macOS) to open the Extensions pane.

3.  Click on the ... button on the top-right corner of the Extensions pane.

4.  Select the "Install from VSIX..." option.

5.  Navigate to the location where your .vsix file is saved, select it and click on the Open button.

6.  VSCode will then install the extension, and you will see it in the Extensions pane.

7.  You can activate it by clicking the green "Enable" button, and you should see it in the list of installed extensions.

8.  You can also install the extension by running the command `code --install-extension <path/to/your.vsix>` in the command prompt.

Note that if the extension is not signed by a verified publisher, VSCode will ask if you want to install it.

Also, Some extensions are not compatible with the current version of VSCode, make sure you are installing the extension that is compatible with your current version of VSCode.
