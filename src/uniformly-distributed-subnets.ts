import { Cidr, IpRange } from 'cidr-calc';
import { UniformlyDistributedSubnetsArguments } from './types.js';
import { validate } from './validate.js';

/**
 * Allocate subnet CIDRs as uniformly as possible across the available space.
 */
export function uniformlyDistributedSubnets({
  neededSubnets,
  cidr,
}: UniformlyDistributedSubnetsArguments): {
  subnetCidrs: Cidr[];
  optimalSubnetCidrPrefixLength: number;
  maxIpsPerSubnet: number;
  parentCidr: Cidr;
} {
  const { parentCidr } = validate({ neededSubnets, cidr });

  /**
   * Where x is the optimal subnet CIDR number
   *       y is parentCidrNumber
   *       z is neededSubnets
   *
   * Theoretical max IPs = 2^(32-y) / z
   * Optimal CIDR number IP space = 2^(32-x)
   *
   * 2^(32-x) = 2^(32-y) / z
   *        x = 32 - log2(2^(32-y) / z)
   *
   * but we can only do the closest power of 2, so we need to round up `x` to get the CIDR number closest to the theoretical max.
   *
   * x = ceil(32 - log2(2^(32-y) / z))
   */
  const optimalSubnetCidrPrefixLength = Math.ceil(
    32 - Math.log2(2 ** (32 - parentCidr.prefixLen) / neededSubnets),
  );

  // Get the actual subnet CIDR blocks needed
  const subnetCidrs: Cidr[] = [];
  let currentCidr: Cidr;
  let currentRange: IpRange;
  let nextStartIpAddr = parentCidr.toIpRange().startIpAddr;
  for (let index = 0; index < neededSubnets; index++) {
    currentCidr = new Cidr(nextStartIpAddr, optimalSubnetCidrPrefixLength);
    currentRange = currentCidr.toIpRange();
    subnetCidrs.push(currentCidr);
    nextStartIpAddr = currentRange.endIpAddr.next();
  }

  const maxIpsPerSubnet = 2 ** (32 - optimalSubnetCidrPrefixLength);

  return {
    subnetCidrs,
    optimalSubnetCidrPrefixLength,
    maxIpsPerSubnet,
    parentCidr,
  };
}
