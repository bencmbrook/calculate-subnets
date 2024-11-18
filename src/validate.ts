import assert from 'node:assert';
import { Cidr, IpAddress } from 'cidr-calc';
import { UniformlyDistributedSubnetsArguments } from './types.js';

export function validate({
  neededBlocks,
  cidr,
}: UniformlyDistributedSubnetsArguments): {
  parentCidr: Cidr;
  availableSpace: number;
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
    availableSpace = 32 - Number(cidrNumberRaw);
  } catch {
    throw new TypeError(`Invalid CIDR provided: ${cidr}`);
  }

  if (
    typeof availableSpace !== 'number' ||
    Number.isNaN(neededBlocks) ||
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
    neededBlocks < 1 ||
    neededBlocks > 2 ** availableSpace
  ) {
    throw new TypeError(
      `Expected "neededBlocks" to be a positive integer between 1 and ${(2 ** availableSpace).toLocaleString()} (which is 2^(32-cidrNumber))`,
    );
  }

  return {
    parentCidr,
    availableSpace,
  };
}
