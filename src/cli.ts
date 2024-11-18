import assert from 'node:assert';
import { parseArgs } from 'node:util';
import { uniformlyDistributedSubnets } from './uniformly-distributed-subnets.js';

function main() {
  const { values } = parseArgs({
    options: {
      /** How many subnets you want in the network */
      ['needed-blocks']: {
        type: 'string',
        short: 'n',
      },
      /** The CIDR number of the network the subnets are going into, e.g., 16 */
      'available-space': {
        type: 'string',
        short: 'a',
      },
    },
  });
  const neededBlocksRaw = values['needed-blocks'];
  const availableSpaceRaw = values['available-space'];
  assert(
    neededBlocksRaw !== undefined,
    'Missing argument: --neededBlocks (or -n for short)',
  );
  assert(
    availableSpaceRaw !== undefined,
    'Missing argument: --availableSpace (or -a for short)',
  );
  const neededBlocks = Number(values['needed-blocks']);
  const availableSpace = Number(values['available-space']);

  const ipsInAvailableSpace = 2 ** availableSpace;
  console.debug(
    `Total IPs in available space: ${ipsInAvailableSpace.toLocaleString()}`,
  );
  console.debug(
    `Theoretical max IPs per block: ${Math.floor(2 ** availableSpace / neededBlocks).toLocaleString()}`,
  );

  const { cidrNumber, maxIpsPerBlock, cidrBlocks } =
    uniformlyDistributedSubnets({
      neededBlocks,
      availableSpace,
    });

  console.info(`CIDR number: /${cidrNumber.toString()}`);
  console.info(`Max IPs per block: ${maxIpsPerBlock.toLocaleString()}`);
  console.info(`\nCIDR blocks:`);
  for (const [index, cidr] of cidrBlocks.entries()) {
    const range = cidr.toIpRange();
    console.info(
      `CIDR ${(index + 1).toString()}: ${cidr.toString()}\tRange:(${range.toString()})`,
    );
  }

  const usedIps = maxIpsPerBlock * neededBlocks;
  const unusedIps = ipsInAvailableSpace - usedIps;
  const percentageUsed = (usedIps / ipsInAvailableSpace) * 100;
  console.info(`\nNumber of unused IPs: ${unusedIps.toLocaleString()}`);
  console.info(
    `Number of used IPs: ${usedIps.toLocaleString()} (${percentageUsed.toFixed(2)}%)`,
  );
}

main();
