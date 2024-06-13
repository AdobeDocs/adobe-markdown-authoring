import "@spectrum-web-components/tabs/sp-tabs.js";
import "@spectrum-web-components/tabs/sp-tab.js";
import "@spectrum-web-components/tabs/sp-tab-panel.js";
import "@spectrum-web-components/badge/sp-badge.js";
import "@spectrum-web-components/theme/sp-theme.js";
import "@spectrum-web-components/theme/theme-light.js";
import "@spectrum-web-components/theme/theme-dark.js";

/**
 * Initializes the Spectrum Preview.
 * This function adds necessary classes to the document's root element to
 * configure the Spectrum CSS framework.
 */
function init() {
  // Log a message to indicate that initialization has started.
  console.log("Initializing Spectrum Preview.");

  // Add necessary classes to the document's root element.
  document.documentElement.classList.add(
    // Configure the Spectrum CSS framework.
    "spectrum",
    "spectrum--medium", // Set the medium density.
    "spectrum--light", // Set the light theme.
    "js-focus-visible" // Enable focus ring on keyboard focus.
  );
}

window.addEventListener("vscode.markdown.updateContent", init);

init();
