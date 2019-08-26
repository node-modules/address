const runscript = require('runscript');
const path = require('path');
const assert = require('assert');

describe('test/ts.test.js', () => {
  it('should works with ts without error', async () => {
    const cwd = path.resolve(__dirname, './fixtures/ts');
    const tsconfigPath = path.resolve(cwd, 'tsconfig.json');
    const testFile = path.resolve(cwd, 'test');
    await runscript(`tsc -p ${tsconfigPath} && node ${testFile}`, { stdio: 'inherit' });
  });
});
