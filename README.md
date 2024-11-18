# Calculate Subnet CIDRs

Split a CIDR into the largest possible subnet CIDRs. Uses [`cidr-calc`](https://github.com/arineng/cidr-calc) for IP ranges.

## Usage

### CLI:

```console
$ npx calculate-subnets --needed-subnets=9 --cidr='10.113.0.0/16'

Network IP range: 10.113.0.0 - 10.113.255.255
Total IPs in network: 65,536
Theoretical max IPs per subnet: 7,281

Subnets' optimal CIDR number: /20
Max IPs per subnet: 4,096

Subnet CIDR blocks:
Subnet 1: 10.113.0.0/20      (IP range: 10.113.0.0 - 10.113.15.255)
Subnet 2: 10.113.16.0/20     (IP range: 10.113.16.0 - 10.113.31.255)
Subnet 3: 10.113.32.0/20     (IP range: 10.113.32.0 - 10.113.47.255)
Subnet 4: 10.113.48.0/20     (IP range: 10.113.48.0 - 10.113.63.255)
Subnet 5: 10.113.64.0/20     (IP range: 10.113.64.0 - 10.113.79.255)
Subnet 6: 10.113.80.0/20     (IP range: 10.113.80.0 - 10.113.95.255)
Subnet 7: 10.113.96.0/20     (IP range: 10.113.96.0 - 10.113.111.255)
Subnet 8: 10.113.112.0/20    (IP range: 10.113.112.0 - 10.113.127.255)
Subnet 9: 10.113.128.0/20    (IP range: 10.113.128.0 - 10.113.143.255)

Unused IP range: 10.113.144.0 - 10.113.255.255
Number of unused IPs: 28,672
Number of used IPs:   36,864 (56.25%)
```

### JS:

```ts
import { uniformlyDistributedSubnets } from 'calculate-subnets';

const { subnetCidrs } = uniformlyDistributedSubnets({
  neededSubnets: 9,
  cidr: '10.113.0.0/16',
});

for (const subnetCidr of subnetCidrs) {
  console.log(subnetCidr.toString());
}
```
