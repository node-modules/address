import { strict as assert } from 'node:assert';
import { address, mac, dns } from '../src/promises.js';

describe('test/promises.test.ts', () => {
  it('should address work', async () => {
    const addr = await address();
    assert(addr.ip);
    assert(addr.ipv6);
    assert(addr.mac);
  });

  it('should mac work', async () => {
    const addr = await mac();
    assert(addr);
  });

  it('should dns work', async () => {
    const servers = await dns();
    assert(servers);
    assert(servers.length > 0);
  });
});
