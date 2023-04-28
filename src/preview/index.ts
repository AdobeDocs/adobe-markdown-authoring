import "@spectrum-web-components/tabs/sp-tabs.js";
import "@spectrum-web-components/tabs/sp-tab.js";
import "@spectrum-web-components/tabs/sp-tab-panel.js";
import "@spectrum-web-components/badge/sp-badge.js";
import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/theme-light.js";
import "@spectrum-web-components/theme/theme-dark.js";

function init() {
  console.log("Initializing Spectrum Preview.");
  document.documentElement.classList.add(
    "spectrum",
    "spectrum--medium",
    "spectrum--light",
    "js-focus-visible"
  );
}

window.addEventListener("vscode.markdown.updateContent", init);

init();
