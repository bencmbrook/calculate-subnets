import { Cidr, IpAddress, IpRange } from 'cidr-calc';
import { validate } from './validate.js';

/**
 * Allocate subnet CIDRs as uniformly as possible across the available space.
 */
export function uniformlyDistributedSubnets({
  neededBlocks,
  availableSpace,
}: {
  neededBlocks: number;
  availableSpace: number;
}): {
  cidrNumber: number;
  maxIpsPerBlock: number;
  cidrBlocks: Cidr[];
} {
  validate({ neededBlocks, availableSpace });

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
  let cidr: Cidr;
  let range: IpRange;
  let nextStartIpAddr: IpAddress = IpAddress.of('0.0.0.0');
  for (let index = 0; index < neededBlocks; index++) {
    cidr = new Cidr(nextStartIpAddr, cidrNumber);
    range = cidr.toIpRange();
    cidrBlocks.push(cidr);
    nextStartIpAddr = range.endIpAddr.next();
  }

  return {
    cidrNumber,
    maxIpsPerBlock,
    cidrBlocks,
  };
}
