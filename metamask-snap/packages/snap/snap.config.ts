import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  bundler: 'webpack',
  input: resolve(__dirname, 'src/index.tsx'),
  output: {
    minimize: false
  },
  sourceMap: "inline",
  server: {
    port: 8080,
  },
  polyfills: {
    buffer: true,
  },
};

export default config;

