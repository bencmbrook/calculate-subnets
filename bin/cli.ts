import assert from 'node:assert';
import { parseArgs } from 'node:util';
import { IpRange } from 'cidr-calc';
import { uniformlyDistributedSubnets } from '../src/uniformly-distributed-subnets.js';
import { validate } from '../src/validate.js';

/**
 * @example
 * ```sh
 * pnpm start -c '10.113.0.0/16' -n 9
 * ```
 */
function main() {
  const {
    values: { ['needed-subnets']: neededSubnetsRaw, cidr: cidrRaw },
  } = parseArgs({
    options: {
      /** How many subnets you want in the network */
      ['needed-subnets']: {
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
    neededSubnetsRaw !== undefined,
    'Missing argument: --neededSubnets (or -n for short)',
  );
  const neededSubnets = Number(neededSubnetsRaw);
  const cidr = cidrRaw ?? '0.0.0.0/16';
  if (!cidrRaw) {
    console.warn('WARNING: No CIDR provided, defaulting to', cidr, '\n');
  }

  try {
    validate({ neededSubnets, cidr });
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Input error:', error.message);
      return;
    }
    throw error;
  }

  const {
    subnetCidrs,
    optimalSubnetCidrPrefixLength,
    maxIpsPerSubnet,
    parentCidr,
  } = uniformlyDistributedSubnets({
    neededSubnets,
    cidr,
  });

  const availableSpace = 32 - parentCidr.prefixLen;
  const ipsInAvailableSpace = 2 ** availableSpace;
  console.info(`Network IP range: ${parentCidr.toIpRange().toString()}`);
  console.debug(
    `Total IPs in network: ${ipsInAvailableSpace.toLocaleString()}`,
  );
  console.debug(
    `Theoretical max IPs per subnet: ${Math.floor(2 ** availableSpace / neededSubnets).toLocaleString()}`,
  );
  console.info('');
  console.info(
    `Subnets' optimal CIDR number: /${optimalSubnetCidrPrefixLength.toString()}`,
  );
  console.info(`Max IPs per subnet: ${maxIpsPerSubnet.toLocaleString()}`);
  console.info(`\nSubnet CIDR blocks:`);
  for (const [index, cidr] of subnetCidrs.entries()) {
    const range = cidr.toIpRange();
    console.info(
      `Subnet ${(index + 1).toString()}: ${cidr.toString()}`.padEnd(28) +
        ` (IP range: ${range.toString()})`,
    );
  }
  console.info('');

  const usedIps = maxIpsPerSubnet * neededSubnets;
  const unusedIps = ipsInAvailableSpace - usedIps;
  const percentageUsed = (usedIps / ipsInAvailableSpace) * 100;
  const lastCidr = subnetCidrs.at(-1);
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
