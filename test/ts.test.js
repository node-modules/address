const runscript = require('runscript');
const path = require('path');
const assert = require('assert');

describe('test/ts.test.js', function() {
  it('should works with ts without error', function (done) {
    const cwd = path.resolve(__dirname, './fixtures/ts');
    const tsconfigPath = path.resolve(cwd, 'tsconfig.json');
    const testFile = path.resolve(cwd, 'test');
    runscript(`tsc -p ${tsconfigPath} && node ${testFile}`, { stdio: 'inherit' })
      .then(() => done())
      .catch(done);
  });
});
