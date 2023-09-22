import assert from 'node:assert';
import os from 'node:os';
import mm from 'mm';
import path from 'node:path';
import child from 'node:child_process';
import fs from 'node:fs';
import * as address from 'address';

mm(address, 'interface', () => ({ address: os.platform() === 'linux' ? '10.125.5.202' : '192.168.2.104' }));
mm.data(child, 'exec', fs.readFileSync(path.join(__dirname, `../${os.platform() + '.txt'}`), 'utf8'));

address.dns((err, servers) => {
  assert(!err);
  assert(Array.isArray(servers));
  assert(servers.length > 0);
});

address.dns('/etc/resolv.conf', (err, servers) => {
  assert(!err);
  assert(Array.isArray(servers));
  assert(servers.length > 0);
});

address.ip('utun');
address.ip();
address.ipv6();
address.ipv6('utun');

address.mac((err, mac) => {
  assert(!err);
  assert(mac);
  assert(mac.substring(0));
});

const interfaceName = (os.platform() === 'darwin') ? 'en' : 'eth';
address.mac(interfaceName, (err, mac) => {
  assert(!err);
  assert(mac);
  assert(mac.substring(0));
});

address.address(interfaceName, (err, addr) => {
  assert(!err);
  assert(addr.ip);
  assert(addr.ip.substring(0));
  assert(addr.ipv6);
  assert(addr.ipv6.substring(0));
  assert(addr.mac);
  assert(addr.mac.substring(0));
});

address.address((err, addr) => {
  assert(!err);
  assert(addr.ip);
  assert(addr.ip.substring(0));
  assert(addr.ipv6);
  assert(addr.ipv6.substring(0));
  assert(addr.mac);
  assert(addr.mac.substring(0));
});
