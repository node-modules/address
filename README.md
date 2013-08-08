address [![Build Status](https://secure.travis-ci.org/fengmk2/address.png)](http://travis-ci.org/fengmk2/address) [![Coverage Status](https://coveralls.io/repos/fengmk2/address/badge.png)](https://coveralls.io/r/fengmk2/address)
=======

![logo](https://raw.github.com/fengmk2/address/master/logo.png)

Get current machine IP, MAC and DNS servers.

DNS servers receive from `/etc/resolv.conf`.

## Install

```bash
$ npm install address
```

## Usage

Get IP is sync and get MAC is async for now.

```js
var address = require('address');

// default interface 'eth' on linux, 'en' on osx.
address.ip();   // '192.168.0.2'
address.ipv6(); // 'fe80::7aca:39ff:feb0:e67d'
address.mac(function (err, addr) {
  console.log(addr); // '78:ca:39:b0:e6:7d'
});

// local loopback
address.ip('lo'); // '127.0.0.1'

// vboxnet MAC
address.mac('vboxnet', function (err, addr) {
  console.log(addr); // '0a:00:27:00:00:00'
});
```

### Get all addresses: IPv4, IPv6 and MAC

```js
address(function (err, addrs) {
  console.log(addrs.ip, addrs.ipv6, addrs.mac);
  // '192.168.0.2', 'fe80::7aca:39ff:feb0:e67d', '78:ca:39:b0:e6:7d'
});

address('vboxnet', function (err, addrs) {
  console.log(addrs.ip, addrs.ipv6, addrs.mac);
  // '192.168.56.1', null, '0a:00:27:00:00:00'
});
```

### Get an interface info with family

```js
address.interface('IPv4', 'eth1');
// { address: '192.168.1.1', family: 'IPv4', mac: '78:ca:39:b0:e6:7d' }
```

### Get DNS servers

```js
address.dns(function (err, addrs) {
  console.log(addrs);
  // ['10.13.2.1', '10.13.2.6']
});
```

## License 

(The MIT License)

Copyright (c) 2013 fengmk2 &lt;fengmk2@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
