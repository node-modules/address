export = address;

declare interface Address {
  p: string;
  ipv6: string;
  mac: string;
}

declare type AddressCallback = (err: Error, addr: Address) => void;
declare type MacCallback = (err: Error, addr: string) => void;
declare type DnsCallback = (err: Error, servers: string[]) => void;

declare function address(interfaceName: string | AddressCallback, callback?: AddressCallback): void;

declare namespace address {
  const MAC_IP_RE: RegExp;
  const MAC_RE: RegExp;

  function dns(filepath: string | DnsCallback, callback?: DnsCallback): void;
  function ip(interfaceName?: string): any;
  function ipv6(interfaceName?: string): any;
  function mac(interfaceName: string | MacCallback, callback?: MacCallback): void;
}
