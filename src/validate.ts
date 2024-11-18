import assert from 'node:assert';
import { Cidr, IpAddress } from 'cidr-calc';
import { UniformlyDistributedSubnetsArguments } from './types.js';

export function validate({
  neededBlocks,
  cidr,
}: UniformlyDistributedSubnetsArguments): {
  parentCidr: Cidr;
} {
  let parentCidr: Cidr;
  let availableSpace: number;
  try {
    const [ipRaw, cidrNumberRaw] = cidr.split('/');
    assert(typeof ipRaw === 'string');
    assert(
      typeof cidrNumberRaw === 'string' &&
        Number.isInteger(Number(cidrNumberRaw)),
    );
    parentCidr = new Cidr(IpAddress.of(ipRaw), Number(cidrNumberRaw));
    availableSpace = 32 - parentCidr.prefixLen;
  } catch {
    throw new TypeError(`Invalid CIDR provided: ${cidr}`);
  }

  if (
    typeof availableSpace !== 'number' ||
    Number.isNaN(availableSpace) ||
    !Number.isInteger(availableSpace) ||
    availableSpace < 0 ||
    availableSpace > 32
  ) {
    throw new TypeError(
      'Expected `cidr` number to be a positive integer between 1 and 32, representing the number of available bits in the parent CIDR block',
    );
  }

  if (
    typeof neededBlocks !== 'number' ||
    Number.isNaN(neededBlocks) ||
    !Number.isInteger(neededBlocks) ||
    neededBlocks < 1
  ) {
    throw new TypeError(`Expected "neededBlocks" to be a positive integer.`);
  }

  if (neededBlocks > 2 ** availableSpace) {
    throw new TypeError(
      `The number of blocks needed (${neededBlocks.toLocaleString()}) exceeds the available space in the parent CIDR block (${(2 ** availableSpace).toLocaleString()})`,
    );
  }
  return {
    parentCidr,
  };
}
