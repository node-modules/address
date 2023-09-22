import address from 'address';
import { ip, ipv6 } from 'address';
import { address as addr } from 'address/promises';

console.log('ip=%o', ip());
console.log('ipv6=%o', ipv6());
console.log('await address=%o', await addr());

address((_, a) => {
  console.log('callback address=%o', a);
});
