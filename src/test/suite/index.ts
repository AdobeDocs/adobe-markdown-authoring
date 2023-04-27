import glob from "glob";
import Mocha from "mocha";
import path from "path";

function globPromise(pattern: string, options: glob.IOptions): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, matches) => {
      if (err) {
        reject(err);
      } else {
        resolve(matches);
      }
    });
  });
}

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
  });

  const testsRoot = path.resolve(__dirname, "..");

  return globPromise("**/**.test.js", { cwd: testsRoot })
    .then((files: string[]) => {
      // Add files to the test suite
      files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

      // Run the mocha test
      return new Promise<void>((resolve, reject) => {
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      });
    })
    .catch((err: any) => {
      console.error(err);
      return Promise.reject(err);
    });
}
