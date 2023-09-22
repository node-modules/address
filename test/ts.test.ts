import path from 'node:path';
import { fileURLToPath } from 'node:url';
import runscript from 'runscript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('test/ts.test.ts', () => {
  it('should works with ts without error', done => {
    const cwd = path.join(__dirname, './fixtures/ts');
    const tsconfigPath = path.join(cwd, 'tsconfig.json');
    runscript(`tsc -p ${tsconfigPath}`, { stdio: 'inherit' })
      .then(() => done())
      .catch(done);
  });
});
