const runscript = require('runscript');
const path = require('path');

describe('test/ts.test.js', () => {
  it('should works with ts without error', done => {
    const cwd = path.resolve(__dirname, './fixtures/ts');
    const tsconfigPath = path.resolve(cwd, 'tsconfig.json');
    runscript(`tsc -p ${tsconfigPath}`, { stdio: 'inherit' })
      .then(() => done())
      .catch(done);
  });
});
