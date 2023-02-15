import "@spectrum-web-components/tabs/sp-tabs.js";
import "@spectrum-web-components/tabs/sp-tab.js";
import "@spectrum-web-components/tabs/sp-tab-panel.js";
import "@spectrum-web-components/theme/src/themes.js";

function init() {
  console.log("Initializing Spectrum Preview.");
  document.documentElement.classList.add(
    "spectrum",
    "spectrum--medium",
    "spectrum--light",
    "js-focus-visible"
  );

  // const configSpan = document.getElementById('markdown-mermaid');
  // const darkModeTheme = configSpan?.dataset.darkModeTheme;
  // const lightModeTheme = configSpan?.dataset.lightModeTheme;

  // const config = {
  //     startOnLoad: false,
  //     theme: document.body.classList.contains('vscode-dark') || document.body.classList.contains('vscode-high-contrast')
  //         ? darkModeTheme ?? 'dark'
  //         : lightModeTheme ?? 'default'
  // };
  // mermaid.initialize(config);

  // renderMermaidBlocksInElement(document.body);
}

window.addEventListener("vscode.markdown.updateContent", init);

init();
