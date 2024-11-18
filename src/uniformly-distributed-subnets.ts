import { Cidr, IpRange } from 'cidr-calc';
import { UniformlyDistributedSubnetsArguments } from './types.js';
import { validate } from './validate.js';

/**
 * Allocate subnet CIDRs as uniformly as possible across the available space.
 */
export function uniformlyDistributedSubnets({
  neededBlocks,
  cidr,
}: UniformlyDistributedSubnetsArguments): {
  cidrBlocks: Cidr[];
  cidrNumber: number;
  maxIpsPerBlock: number;
  availableSpace: number;
  parentCidr: Cidr;
} {
  const { parentCidr, availableSpace } = validate({ neededBlocks, cidr });

  /**
   * Where x is the CIDR number
   *       y is availableSpace
   *       z is neededBlocks
   *
   * Theoretical max IPs = 2^y / z
   * CIDR number IP space = 2^(32-x)
   *
   * Solving for theoretical `x`:
   *
   * `2^(32-x) = 2^y / z`
   * ... which simplies to x = log( (2^32-y) * z / log(2) )
   *
   * but we can only do the closest power of 2, so we need to round up `x` to get our CIDR number.
   */
  const cidrNumber = Math.ceil(
    Math.log(2 ** (32 - availableSpace) * neededBlocks) / Math.log(2),
  );

  const maxIpsPerBlock = 2 ** (32 - cidrNumber);

  // Get the actual CIDR blocks needed
  const cidrBlocks: Cidr[] = [];
  let currentCidr: Cidr;
  let currentRange: IpRange;
  let nextStartIpAddr = parentCidr.toIpRange().startIpAddr;
  for (let index = 0; index < neededBlocks; index++) {
    currentCidr = new Cidr(nextStartIpAddr, cidrNumber);
    currentRange = currentCidr.toIpRange();
    cidrBlocks.push(currentCidr);
    nextStartIpAddr = currentRange.endIpAddr.next();
  }

  return {
    cidrBlocks,
    cidrNumber,
    maxIpsPerBlock,
    availableSpace,
    parentCidr,
  };
}
