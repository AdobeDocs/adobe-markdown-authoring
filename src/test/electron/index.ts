import * as path from "path";
import Mocha from "mocha";

// Import test suites directly. The mere act of importing them registers their suites with Mocha.
import "./shortcuts/administration.test";
import "./shortcuts/availability.test";
import "./shortcuts/bold.test";
import "./shortcuts/bullets.test";
import "./shortcuts/caution.test";
import "./shortcuts/codeblock.test";
import "./shortcuts/error.test";
import "./shortcuts/headers.test";
import "./shortcuts/important.test";
import "./shortcuts/info.test";
import "./shortcuts/inlinecode.test";
import "./shortcuts/italic.test";
import "./shortcuts/morelikethis.test";
import "./shortcuts/note.test";
import "./shortcuts/prerequisites.test";
import "./shortcuts/strikethrough.test";
import "./shortcuts/success.test";
import "./shortcuts/tip.test";
import "./shortcuts/video.test";
import "./shortcuts/warning.test";

export async function run(): Promise<void> {
  const mocha = new Mocha({
    ui: "tdd", // Use TDD UI with suite, test, etc.
    color: true,
  });

  // No need to manually add files to Mocha, as they are automatically registered upon import

  // Run the tests and handle the results
  return new Promise<void>((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });
  });
}
