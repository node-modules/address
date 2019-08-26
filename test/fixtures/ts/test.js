"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const address = require("address");
const os = require("os");
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
const interfaceName = os.platform() === 'darwin' ? 'en' : 'eth';
address.mac(interfaceName, (err, mac) => {
    assert(!err);
    assert(mac);
    assert(mac.substring(0));
    console.info(mac.ssss);
});
address(interfaceName, (err, addr) => {
    assert(!err);
    assert(addr.ip);
    assert(addr.ip.substring(0));
    assert(addr.ipv6);
    assert(addr.ipv6.substring(0));
    assert(addr.mac);
    assert(addr.mac.substring(0));
});
address((err, addr) => {
    assert(!err);
    assert(addr.ip);
    assert(addr.ip.substring(0));
    assert(addr.ipv6);
    assert(addr.ipv6.substring(0));
    assert(addr.mac);
    assert(addr.mac.substring(0));
});
