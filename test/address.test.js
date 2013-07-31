/*!
 * address - test/address.test.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var os = require('os');
var child = require('child_process');
var path = require('path');
var should = require('should');
var mm = require('mm');
var fs = require('fs');
var pedding = require('pedding');
var address = require('../');

var fixtures = path.join(__dirname, 'fixtures');

describe('address.test.js', function () {
  beforeEach(mm.restore);

  describe('regex check', function () {
    it('should MAC_IP_RE pass', function () {
      should.ok(address.MAC_IP_RE.test('  inet 10.7.84.211 netmask 0xfffffc00 broadcast 10.7.87.255'));
      should.ok(address.MAC_IP_RE.test('          inet addr:10.125.5.202  Bcast:10.125.15.255  Mask:255.255.240.0'));
    });

    it('should MAC_RE pass', function () {
      should.ok(address.MAC_RE.test('    ether c4:2c:03:32:d5:3d '));
      should.ok(address.MAC_RE.test('eth0      Link encap:Ethernet  HWaddr 00:16:3E:00:0A:29  '));
    });
  });

  describe('address()', function () {
    it('should return first ethernet addrs', function (done) {
      address(function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.mac.should.match(/^(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}$/i);
        addr.ip.should.match(/^\d+\.\d+\.\d+\.\d+$/);
        done();
      });
    });

    it('should return first ethernet addrs from osx', function (done) {
      mm(address, 'ip', function () {
        return '192.168.2.104';
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'darwin.txt'), 'utf8'));
      address('en', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.ip.should.equal('192.168.2.104');
        // addr.ipv6.should.match(/^[a-z0-9]{4}\:\:[a-z0-9]{4}\:[a-z0-9]{4}\:[a-z0-9]{4}\:[a-z0-9]{4}$/);
        addr.mac.should.equal('78:ca:39:b0:e6:7d');
        done();
      });
    });

    it('should return first ethernet addrs from linux', function (done) {
      mm(address, 'ip', function () {
        return '10.125.5.202';
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'linux.txt'), 'utf8'));
      address('eth', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.ip.should.equal('10.125.5.202');
        // addr.ipv6.should.match(/^[a-z0-9]{4}\:\:[a-z0-9]{4}\:[a-z0-9]{4}\:[a-z0-9]{4}\:[a-z0-9]{4}$/);
        addr.mac.should.equal('00:16:3E:00:0A:29');
        done();
      });
    });

    it('should return first vnic interface addrs from osx', function (done) {
      mm(address, 'ip', function () {
        return '10.211.55.2';
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'darwin.txt'), 'utf8'));
      address('vnic', function (err, addr) {
        should.not.exists(err);
        addr.ip.should.equal('10.211.55.2')
        addr.mac.should.equal('00:1c:42:00:00:08');
        should.not.exists(addr.ipv6);
        done();
      });
    });

    it('should return first local loopback addrs', function (done) {
      address('lo', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.should.property('ip').with.equal('127.0.0.1');
        done();
      });
    });

    it('should return first local loopback addrs from linux', function (done) {
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'linux.txt'), 'utf8'));
      address('lo', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.should.property('ip').with.equal('127.0.0.1');
        done();
      });
    });
  });

  describe('address.mac()', function () {
    it('should return mac address', function (done) {
      mm(address, 'ip', function () {
        return os.platform() === 'linux' ? '10.211.55.2' : '192.168.2.104';
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, os.platform() + '.txt'), 'utf8'));
      address.mac(os.platform() === 'linux' ? 'eth' : 'en', function (err, mac) {
        should.not.exists(err);
        should.exists(mac);
        mac.should.match(/(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}/i);
        done();
      });
    });

    it('should return null when ip not exists', function (done) {
      mm(address, 'ip', function () {
        return null;
      });
      address.mac(function (err, mac) {
        should.not.exists(err);
        should.not.exists(mac);
        done();
      });
    });

    it('should return err when ifconfig cmd exec error', function (done) {
      mm.error(child, 'exec');
      address.mac(function (err, mac) {
        // should.exists(err);
        should.not.exists(mac);
        done();
      });
    });
  });

  describe('address.ip()', function () {
    it('should return 127.0.0.1', function () {
      address.ip('lo').should.equal('127.0.0.1');
    });
  });

  describe('address.dns()', function () {
    it('should return dns servers from osx', function (done) {
      mm.data(fs, 'readFile', fs.readFileSync(path.join(fixtures, 'dns_darwin.txt'), 'utf8'));
      address.dns(function (err, servers) {
        should.not.exists(err);
        should.exists(servers);
        servers.should.be.instanceof(Array);
        servers.length.should.above(0);
        done();
      });
    });

    it('should return dns servers from linux', function (done) {
      mm.data(fs, 'readFile', fs.readFileSync(path.join(fixtures, 'dns_linux.txt'), 'utf8'));
      address.dns(function (err, servers) {
        should.not.exists(err);
        should.exists(servers);
        servers.should.be.instanceof(Array);
        servers.length.should.above(0);
        done();
      });
    });

    it('should return err when fs error', function (done) {
      mm.error(fs, 'readFile');
      address.dns(function (err, servers) {
        should.exists(err);
        should.not.exists(servers);
        done();
      });
    });
  });
});
