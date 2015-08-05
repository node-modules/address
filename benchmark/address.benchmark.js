var address = require('..');

suite('address', function () {
  bench('ip()', function () {
    address.ip();
  });

  bench('ipv6()', function () {
    address.ipv6();
  })

  bench('mac()', function (next) {
    // 不加 setImmediate 会报错：RangeError: Maximum call stack size exceeded
    setImmediate(function () {
      address.mac(next);
    });
  });

  bench('dns()', function (next) {
    address.dns(next);
  });
});
