'use strict';

const assert = require('assert');
const os = require('os');
const child = require('child_process');
const path = require('path');
const mm = require('mm');
const fs = require('fs');
const address = require('..');

const fixtures = path.join(__dirname, 'fixtures');

describe('test/address.test.js', () => {
  beforeEach(mm.restore);
  afterEach(mm.restore);

  describe('regex check', () => {
    it('should MAC_IP_RE pass', () => {
      assert(address.MAC_IP_RE.test('  inet 10.7.84.211 netmask 0xfffffc00 broadcast 10.7.87.255'));
      assert(address.MAC_IP_RE.test('          inet addr:10.125.5.202  Bcast:10.125.15.255  Mask:255.255.240.0'));
    });

    it('should MAC_RE pass', () => {
      assert(address.MAC_RE.test('    ether c4:2c:03:32:d5:3d '));
      assert(address.MAC_RE.test('eth0      Link encap:Ethernet  HWaddr 00:16:3E:00:0A:29  '));
    });
  });

  describe('address()', () => {
    it('should return first ethernet addrs', done => {
      address((err, addr) => {
        assert(!err);
        assert.deepStrictEqual(Object.keys(addr), [ 'ip', 'ipv6', 'mac' ]);
        addr.mac && assert.match(addr.mac, /^(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}$/i);
        addr.ip && assert.match(addr.ip, /^\d+\.\d+\.\d+\.\d+$/);
        done();
      });
    });

    it('should return first ethernet addrs from osx', done => {
      mm(address, 'interface', () => {
        return { address: '192.168.2.104' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'darwin.txt'), 'utf8'));
      address('en', (err, addr) => {
        assert(!err);
        assert.deepStrictEqual(Object.keys(addr), [ 'ip', 'ipv6', 'mac' ]);
        assert.strictEqual(addr.ip, '192.168.2.104');
        assert.strictEqual(addr.mac, '78:ca:39:b0:e6:7d');
        done();
      });
    });

    it('should return first ethernet addrs from linux', done => {
      mm(address, 'interface', () => {
        return { address: '10.125.5.202' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'linux.txt'), 'utf8'));
      address('eth', (err, addr) => {
        assert(!err);
        assert.deepStrictEqual(Object.keys(addr), [ 'ip', 'ipv6', 'mac' ]);
        assert.strictEqual(addr.ip, '10.125.5.202');
        assert.strictEqual(addr.mac, '00:16:3E:00:0A:29');
        done();
      });
    });

    it('should return first vnic interface addrs from osx', done => {
      mm(address, 'ip', () => {
        return '10.211.55.2';
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'darwin.txt'), 'utf8'));
      address('vnic', (err, addr) => {
        assert(!err);
        assert.strictEqual(addr.ip, '10.211.55.2');
        assert(!addr.ipv6);
        done();
      });
    });

    it('should return first local loopback addrs', done => {
      address('lo', (err, addr) => {
        assert(!err);
        assert.deepStrictEqual(Object.keys(addr), [ 'ip', 'ipv6', 'mac' ]);
        assert.strictEqual(addr.ip, '127.0.0.1');
        done();
      });
    });

    it('should return first local loopback addrs from linux', done => {
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'linux.txt'), 'utf8'));
      address('lo', (err, addr) => {
        assert(!err);
        assert.deepStrictEqual(Object.keys(addr), [ 'ip', 'ipv6', 'mac' ]);
        assert.strictEqual(addr.ip, '127.0.0.1');
        done();
      });
    });
  });

  describe('interface()', () => {
    it('should return interface with family', () => {
      const item = address.interface();
      assert(item);
      assert(item.address);
      assert(item.family);
    });
  });

  describe('address.mac()', () => {
    it.skip('should return mac', done => {
      address.mac((err, mac) => {
        assert(!err);
        assert(mac);
        assert.match(mac, /(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}/i);
        done();
      });
    });

    it('should return mock mac address', done => {
      mm(address, 'interface', () => {
        return { address: os.platform() === 'linux' ? '10.125.5.202' : '192.168.2.104' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, os.platform() + '.txt'), 'utf8'));
      address.mac(os.platform() === 'linux' ? 'eth' : 'en', (err, mac) => {
        assert(!err);
        assert(mac);
        assert.match(mac, /(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}/i);
        done();
      });
    });

    it('should return null when ip not exists', done => {
      mm(address, 'interface', () => {
        return null;
      });
      address.mac((err, mac) => {
        assert(!err);
        assert(!mac);
        done();
      });
    });

    it('should return err when ifconfig cmd exec error', done => {
      mm(address, 'interface', () => {
        return null;
      });
      mm.error(child, 'exec');
      address.mac((err, mac) => {
        assert(!err);
        assert(!mac);
        done();
      });
    });

    it('should return mac mock win32', done => {
      mm(os, 'platform', () => {
        return 'win32';
      });
      mm(os, 'networkInterfaces', () => {
        return require(path.join(__dirname, './fixtures/win32_interfaces.json'));
      });

      address.mac((err, mac) => {
        assert(!err);
        assert(mac);
        assert.strictEqual(mac, 'e8:2a:ea:8b:c2:20');
        done();
      });
    });

  });

  describe('address.ip()', () => {
    it('should return 127.0.0.1', () => {
      assert.strictEqual(address.ip('lo'), '127.0.0.1');
    });

    it('should return the first not 127.0.0.1 interface', () => {
      mm(os, 'networkInterfaces', () => {
        return {
          lo:
           [{ address: '127.0.0.1',
             family: 'IPv4',
             internal: true }],
          bond0:
           [{ address: '10.206.52.79',
             family: 'IPv4',
             internal: false }] };
      });
      assert.strictEqual(address.ip(), '10.206.52.79');
    });

    it('should return utun1', () => {
      mm(os, 'networkInterfaces', () => {
        return {
          lo:
           [{ address: '127.0.0.1',
             family: 'IPv4',
             internal: true }],
          utun0:
          [{ address: 'fe80::696:ad3d:eeec:1722',
            family: 'IPv6',
            internal: false }],
          utun1:
           [{ address: '10.206.52.79',
             family: 'IPv4',
             internal: false }] };
      });
      assert.strictEqual(address.ip('utun'), '10.206.52.79');
      assert.strictEqual(address.ipv6('utun'), 'fe80::696:ad3d:eeec:1722');
    });
  });

  describe('address.dns()', () => {
    it('should return dns servers from osx', done => {
      mm.data(fs, 'readFile', fs.readFileSync(path.join(fixtures, 'dns_darwin.txt'), 'utf8'));
      address.dns((err, servers) => {
        assert(!err);
        assert(servers);
        assert(Array.isArray(servers));
        assert(servers.length > 0);
        done();
      });
    });

    it('should return dns servers from linux', done => {
      mm.data(fs, 'readFile', fs.readFileSync(path.join(fixtures, 'dns_linux.txt'), 'utf8'));
      address.dns((err, servers) => {
        assert(!err);
        assert(servers);
        assert(Array.isArray(servers));
        assert(servers.length > 0);
        done();
      });
    });

    it('should return err when fs error', done => {
      mm.error(fs, 'readFile');
      address.dns((err, servers) => {
        assert(err);
        assert(!servers);
        done();
      });
    });
  });
});
