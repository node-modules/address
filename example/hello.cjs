const address = require('address').default;
const { ip, ipv6 } = require('address');
const { address: addr } = require('address/promises');

async function main() {
  console.log('ip=%o', ip());
  console.log('ipv6=%o', ipv6());
  console.log('await address=%o', await addr());

  address((_, a) => {
    console.log('callback address=%o', a);
  });
}

main();
