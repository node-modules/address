'use strict';

var os = require('os');
var fs = require('fs');
var child = require('child_process');

var DEFAULT_RESOLV_FILE = '/etc/resolv.conf';

// ether 78:ca:39:b0:e6:7d
// HWaddr 00:16:3E:00:0A:29
// lladdr 00:16:3E:00:0A:29
// * sunos: ether 0:3:ba:17:4b:e1
var MAC_RE = address.MAC_RE = /(?:ether|HWaddr|lladdr)\s+((?:[a-z0-9]{1,2}\:){5}[a-z0-9]{2})/i;

// aix: inet addr:10.125.5.202  Bcast:10.125.15.255  Mask:255.255.240.0
// darwin: inet 192.168.2.104 netmask 0xffffff00 broadcast 192.168.2.255
// freebsd: inet 192.168.2.104 netmask 0xffffff00 broadcast 192.168.2.255
// linux: inet addr:10.125.5.202  Bcast:10.125.15.255  Mask:255.255.240.0
// openbsd: inet 10.125.5.202 netmask 0xffffff00 broadcast 10.125.15.255
// sunos: inet 10.125.5.202 netmask ffffff00 broadcast 10.125.15.255
var MAC_IP_RE = address.MAC_IP_RE = /inet\s(?:addr\:)?(\d+\.\d+\.\d+\.\d+)/;

// nameserver 172.24.102.254
var DNS_SERVER_RE = /^nameserver\s+(\d+\.\d+\.\d+\.\d+)$/i;

/**
 * Get prefix of network interface
 *
 * track from Node.js LTS implement: https://nodejs.org/dist/latest-v8.x/docs/api/os.html#os_os_platform
 *
 * network interface reference:
 * - aix: https://www.ibm.com/developerworks/aix/library/au-aixnetworking/index.html
 * - darwin: en
 * - freebsd: https://www.freebsd.org/doc/handbook/config-network-setup.html
 * - linux: eth
 * - openbsd: https://www.openbsd.org/faq/faq6.html
 * - sunos: https://www.unix.com/man-page/sunos/1M/ifconfig/
 * - win32: ''
 *
 * @return {String}
 */
function getInterfaceName() {
  switch (os.platform()) {
    case 'aix':     return 'en';
    case 'darwin':  return 'en';
    case 'freebsd': return 'dc';
    case 'linux':   return 'eth';
    case 'openbsd': return 'fxp';
    case 'sunos':   return 'qfe';
    default: return '';
  }
}

function getIfconfigCMD() {
  if (os.platform() === 'win32') {
    return 'ipconfig/all';
  }
  return '/sbin/ifconfig';
}

/**
 * Extract MAC start line info
 * - aix start line:     'en0      Link encap:Ethernet  HWaddr 00:16:3E:00:0A:29  '
 * - darwin start line:  'en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500'
 * - freebsd start line: 'dc0:    flags=8843<UP,BROADCAST,RUNNING,SIMPLEX,MULTICAST> metric 0 mtu 1500'
 * - linux start line:   'eth0      Link encap:Ethernet  HWaddr 00:16:3E:00:0A:29  '
 * - openbsd start line: 'fxp0:   flags=8843<UP,BROADCAST,RUNNING,SIMPLEX,MULTICAST> mtu 1500'
 * - sunos start line:   'qfe1: flags=1100843<UP,BROADCAST,RUNNING,MULTICAST,ROUTER,IPv4> mtu'
 *
 * @param {String} str
 * @return {Array|Boolean}
 */
function extractMACStartLine(str) {
  var MAC_AIX_START_LINE = /^(\w+)\s{2,}link encap:\w+/i;
  var MAC_DARWIN_START_LINE = /^(\w+)\:\s+flags=/;
  var MAC_FREEBSD_START_LINE = /^(\w+)\:\s+flags=/;
  var MAC_LINUX_START_LINE = /^(\w+)\s{2,}link encap:\w+/i;
  var MAC_OPENBSD_START_LINE = /^(\w+)\:\s+flags=/;
  var MAC_SUNOS_START_LINE = /^(\w+)\:\s+flags=/;

  return MAC_AIX_START_LINE.exec(str) ||
    MAC_DARWIN_START_LINE.exec(str)   ||
    MAC_FREEBSD_START_LINE.exec(str)  ||
    MAC_LINUX_START_LINE.exec(str)    ||
    MAC_OPENBSD_START_LINE.exec(str)  ||
    MAC_SUNOS_START_LINE.exec(str);
}

function getMAC(content, interfaceName, matchIP) {
  var lines = content.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trimRight();
    var m = extractMACStartLine(line);
    if (!m) {
      continue;
    }

    // check interface name
    var name = m[1];
    if (name.indexOf(interfaceName) !== 0) {
      continue;
    }

    var ip = null;
    var mac = null;
    var match = MAC_RE.exec(line);
    if (match) {
      mac = match[1];
    }

    i++;
    while (true) {
      line = lines[i];
      if (!line || extractMACStartLine(line)) {
        i--;
        break; // hit next interface, handle next interface
      }
      if (!mac) {
        match = MAC_RE.exec(line);
        if (match) {
          mac = match[1];
        }
      }

      if (!ip) {
        match = MAC_IP_RE.exec(line);
        if (match) {
          ip = match[1];
        }
      }

      i++;
    }

    if (ip === matchIP) {
      return mac;
    }
  }
}

/**
 * Get all addresses
 *
 * @param {String} [interfaceName] interface name, default is 'eth' on linux, 'en' on mac os.
 * @param {Function(err, addr)} callback
 *  - {Object} addr {
 *    - {String} ip
 *    - {String} ipv6
 *    - {String} mac
 *  }
 */
function address(interfaceName, callback) {
  if (typeof interfaceName === 'function') {
    callback = interfaceName;
    interfaceName = null;
  }
  var addr = {
    ip: address.ip(interfaceName),
    ipv6: address.ipv6(interfaceName),
    mac: null
  };
  address.mac(interfaceName, function (err, mac) {
    if (mac) {
      addr.mac = mac;
    }
    callback(err, addr);
  });
}

address.interface = function (family, name) {
  var interfaces = os.networkInterfaces();
  var noName = !name;
  name = name || getInterfaceName();
  family = family || 'IPv4';
  for (var i = -1; i < 8; i++) {
    var interfaceName = name + (i >= 0 ? i : ''); // support 'lo' and 'lo0'
    var items = interfaces[interfaceName];
    if (items) {
      for (var j = 0; j < items.length; j++) {
        var item = items[j];
        if (item.family === family) {
          return item;
        }
      }
    }
  }

  if (noName) {
    // filter 127.0.0.1, get the first ip
    for (var k in interfaces) {
      var items = interfaces[k];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.family === family && item.address !== '127.0.0.1') {
          return item;
        }
      }
    }
  }
  return;
};

/**
 * Get current machine IPv4
 *
 * @param {String} [interfaceName] interface name, default is 'eth' on linux, 'en' on mac os.
 * @return {String} IP address
 */
address.ip = function (interfaceName) {
  var item = address.interface('IPv4', interfaceName);
  return item && item.address;
};

/**
 * Get current machine IPv6
 *
 * @param {String} [interfaceName] interface name, default is 'eth' on linux, 'en' on mac os.
 * @return {String} IP address
 */
address.ipv6 = function (interfaceName) {
  var item = address.interface('IPv6', interfaceName);
  return item && item.address;
};

/**
 * Get current machine MAC address
 *
 * @param {String} [interfaceName] interface name, default is 'eth' on linux, 'en' on mac os.
 * @param {Function(err, address)} callback
 */
address.mac = function (interfaceName, callback) {
  if (typeof interfaceName === 'function') {
    callback = interfaceName;
    interfaceName = null;
  }
  interfaceName = interfaceName || getInterfaceName();
  var item = address.interface('IPv4', interfaceName);
  if (!item) {
    return callback();
  }

  // https://github.com/nodejs/node/issues/13581
  // bug in node 7.x and <= 8.4.0
  if (!process.env.CI && (item.mac === 'ff:00:00:00:00:00' || item.mac === '00:00:00:00:00:00')) {
    // wrong address, ignore it
    item.mac = '';
  }

  if (item.mac) {
    return callback(null, item.mac);
  }

  child.exec(getIfconfigCMD(), { timeout: 5000 }, function (err, stdout, stderr) {
    if (err || !stdout) {
      return callback(err);
    }

    var mac = getMAC(stdout || '', interfaceName, item.address);
    callback(null, mac);
  });
};

/**
 * Get DNS servers.
 *
 * @param {String} [filepath] resolv config file path. default is '/etc/resolv.conf'.
 * @param {Function(err, servers)} callback
 */
address.dns = function (filepath, callback) {
  if (typeof filepath === 'function') {
    callback = filepath;
    filepath = null;
  }
  filepath = filepath || DEFAULT_RESOLV_FILE;
  fs.readFile(filepath, 'utf8', function (err, content) {
    if (err) {
      return callback(err);
    }
    var servers = [];
    content = content || '';
    var lines = content.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      var m = DNS_SERVER_RE.exec(line);
      if (m) {
        servers.push(m[1]);
      }
    }

    callback(null, servers);
  });
};

module.exports = address;
