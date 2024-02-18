import Mocha from "mocha";
import path from "path";
import glob from "glob";

async function runTests() {
  // Create a new Mocha instance
  const mocha = new Mocha({
    ui: "tdd", // or "bdd" if you prefer
    color: true,
  });

  // Define the directory containing your test files
  const testsDir = path.resolve(__dirname, "./");

  // Search for test files
  glob("**/*.test.ts", { cwd: testsDir }, (err, files) => {
    if (err) {
      console.error("Could not find any test files.", err);
      process.exit(1);
    }

    // Add files to Mocha
    files.forEach((file) => mocha.addFile(path.resolve(testsDir, file)));

    // Run the tests
    mocha.run((failures) => {
      process.exitCode = failures ? 1 : 0; // exit with non-zero status if there were failures
    });
  });
}

runTests();
