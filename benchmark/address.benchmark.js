var Benchmark = require('benchmark');
var benchmarks = require('beautify-benchmark');

var suite = new Benchmark.Suite();

var address = require('..');
var os = require('os');

suite.add('os.platform()', function() {
  os.platform();
});

suite.on('cycle', function(event) {
  benchmarks.add(event.target);
});

suite.on('start', function(event) {
  console.log('\n  Starting...',
    process.version, Date());
});

suite.on('complete', function done() {
  benchmarks.log();
});

suite.run({ 'async': false });


// os.platform() x 67,436,816 ops/sec ±1.56% (84 runs sampled)