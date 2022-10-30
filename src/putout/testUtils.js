const fs = require('fs');
const path = require('path');
const putout = require('putout');

function extensionForParser(parser) {
  switch (parser) {
    case 'ts':
    case 'tsx':
      return parser;
    default:
      return 'js';
  }
}

function applyTransform(module, options, input, testOptions = {}) {
  // Handle ES6 modules using default export for the transform
  const transform = module.default ? module.default : module;

  const { code: output } = putout(input.source, {
    isTS: (testOptions.parser || module.parser) === 'ts',
    plugins: [['test-transform', transform]],
  });

  return (output || '').trim();
}
exports.applyTransform = applyTransform;

function runInlineTest(module, options, input, expectedOutput, testOptions) {
  const output = applyTransform(module, options, input, testOptions);
  expect(output).toEqual(expectedOutput.trim());
  return output;
}
exports.runInlineTest = runInlineTest;

/**
 * Utility function to run a jscodeshift script within a unit test. This makes
 * several assumptions about the environment:
 *
 * - `dirName` contains the name of the directory the test is located in. This
 *   should normally be passed via __dirname.
 * - The test should be located in a subdirectory next to the transform itself.
 *   Commonly tests are located in a directory called __tests__.
 * - `transformName` contains the filename of the transform being tested,
 *   excluding the .js extension.
 * - `testFilePrefix` optionally contains the name of the file with the test
 *   data. If not specified, it defaults to the same value as `transformName`.
 *   This will be suffixed with ".input.js" for the input file and ".output.js"
 *   for the expected output. For example, if set to "foo", we will read the
 *   "foo.input.js" file, pass this to the transform, and expect its output to
 *   be equal to the contents of "foo.output.js".
 * - Test data should be located in a directory called __testfixtures__
 *   alongside the transform and __tests__ directory.
 */
function runTest(dirName, transformName, options, testFilePrefix, testOptions = {}) {
  if (!testFilePrefix) {
    testFilePrefix = transformName;
  }

  const extension = extensionForParser(testOptions.parser);
  const fixtureDir = path.join(dirName, '..', '__testfixtures__');
  const inputPath = path.join(fixtureDir, testFilePrefix + `.input.${extension}`);
  const source = fs.readFileSync(inputPath, 'utf8');
  const expectedOutput = fs.readFileSync(path.join(fixtureDir, testFilePrefix + `.output.${extension}`), 'utf8');
  // Assumes transform is one level up from __tests__ directory
  const module = require(path.join(dirName, '..', transformName));
  runInlineTest(
    module,
    options,
    {
      path: inputPath,
      source,
    },
    expectedOutput,
    testOptions
  );
}
exports.runTest = runTest;

/**
 * Handles some boilerplate around defining a simple jest/Jasmine test for a
 * jscodeshift transform.
 */
function defineTest(dirName, transformName, options, testFilePrefix, testOptions) {
  const testName = testFilePrefix ? `transforms correctly using "${testFilePrefix}" data` : 'transforms correctly';
  describe(transformName, () => {
    it(testName, () => {
      runTest(dirName, transformName, options, testFilePrefix, testOptions);
    });
  });
}
exports.defineTest = defineTest;
