// @ts-check
import { builtinModules } from 'node:module';
import typescript from '@rollup/plugin-typescript';
import packageJson from './package.json' with { type: 'json' };

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/main.ts',
  output: [
    {
      file: packageJson.exports.import.default,
      format: 'esm',
      sourcemap: true,
    },
    {
      file: packageJson.exports.require.default,
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [typescript()],
  external: [
    ...builtinModules,
    ...Object.keys(packageJson.devDependencies),
    // ...(Object.keys(packageJson.peerDependencies)),
    // ...(Object.keys(packageJson.dependencies)),
  ],
};
export default config;
