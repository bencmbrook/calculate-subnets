import { UniformlyDistributedSubnetsArguments } from './types.js';

export function validate({
  neededBlocks,
  availableSpace,
}: UniformlyDistributedSubnetsArguments) {
  if (
    typeof availableSpace !== 'number' ||
    Number.isNaN(neededBlocks) ||
    !Number.isInteger(availableSpace) ||
    availableSpace < 1 ||
    availableSpace > 32
  ) {
    throw new TypeError(
      'Expected "availableSpace" to be a positive integer between 1 and 32, representing the number of available bits in the parent CIDR block',
    );
  }

  if (
    typeof neededBlocks !== 'number' ||
    Number.isNaN(neededBlocks) ||
    !Number.isInteger(neededBlocks) ||
    neededBlocks < 1 ||
    neededBlocks > 2 ** availableSpace / 2
  ) {
    throw new TypeError(
      `Expected "neededBlocks" to be a positive integer between 1 and ${(2 ** availableSpace / 2).toLocaleString()} (which is 2^availableSpace / 2)`,
    );
  }
}
