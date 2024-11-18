import assert from 'node:assert';
import { parseArgs } from 'node:util';
import { IpRange } from 'cidr-calc';
import { uniformlyDistributedSubnets } from '../src/uniformly-distributed-subnets.js';

/**
 * @example
 * ```sh
 * pnpm start -c '10.113.0.0/16' -n 9
 * ```
 */
function main() {
  const {
    values: { ['needed-blocks']: neededBlocksRaw, cidr: cidrRaw },
  } = parseArgs({
    options: {
      /** How many subnets you want in the network */
      ['needed-blocks']: {
        type: 'string',
        short: 'n',
      },
      /** The CIDR of the parent network the subnets are going into */
      cidr: {
        type: 'string',
        short: 'c',
        description:
          'The CIDR of the parent network the subnets are going into, e.g., 16',
      },
    },
  });

  assert(
    neededBlocksRaw !== undefined,
    'Missing argument: --neededBlocks (or -n for short)',
  );
  const neededBlocks = Number(neededBlocksRaw);
  const cidr = cidrRaw ?? '0.0.0.0/16';
  if (!cidrRaw) {
    console.warn('WARNING: No CIDR provided, defaulting to', cidr, '\n');
  }

  const { cidrBlocks, cidrNumber, maxIpsPerBlock, availableSpace, parentCidr } =
    uniformlyDistributedSubnets({
      neededBlocks,
      cidr,
    });

  const ipsInAvailableSpace = 2 ** availableSpace;
  console.info(`Network IP range: ${parentCidr.toIpRange().toString()}`);
  console.debug(
    `Total IPs in network: ${ipsInAvailableSpace.toLocaleString()}`,
  );
  console.debug(
    `Theoretical max IPs per subnet: ${Math.floor(2 ** availableSpace / neededBlocks).toLocaleString()}`,
  );
  console.info('');
  console.info(`Subnets' CIDR number: /${cidrNumber.toString()}`);
  console.info(`Max IPs per subnet: ${maxIpsPerBlock.toLocaleString()}`);
  console.info(`\nCIDR blocks:`);
  for (const [index, cidr] of cidrBlocks.entries()) {
    const range = cidr.toIpRange();
    console.info(
      `Subnet ${(index + 1).toString()}: ${cidr.toString()}`.padEnd(28) +
        ` (IP range: ${range.toString()})`,
    );
  }
  console.info('');

  const usedIps = maxIpsPerBlock * neededBlocks;
  const unusedIps = ipsInAvailableSpace - usedIps;
  const percentageUsed = (usedIps / ipsInAvailableSpace) * 100;
  const lastCidr = cidrBlocks.at(-1);
  if (lastCidr && unusedIps) {
    console.info(
      `Unused IP range: ${new IpRange(lastCidr.toIpRange().endIpAddr.next(), parentCidr.toIpRange().endIpAddr).toString()}`,
    );
  }
  console.info(`Number of unused IPs: ${unusedIps.toLocaleString()}`);
  console.info(
    `Number of used IPs:   ${usedIps.toLocaleString()} (${percentageUsed.toFixed(2)}%)`,
  );
}

main();
