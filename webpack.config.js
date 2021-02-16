const PROJECT_NAME = "openhps-react-native";
const LIBRARY_NAME = "@openhps/react-native";

const path = require('path');

module.exports = env => [
  {
    name: PROJECT_NAME,
    mode: env.prod ? "production" : "development",
    entry: `./dist/cjs/index.js`,
    devtool: 'source-map',
    externals: ['@openhps/core'],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `web/${PROJECT_NAME}${env.prod ? ".min" : ""}.${env.module ? 'mjs' : 'js'}`,
      library: LIBRARY_NAME,
      libraryTarget: 'umd',
      umdNamedDefine: true,
      globalObject: `(typeof self !== 'undefined' ? self : this)`,
    },
    resolve: {
      alias: {
        typescript: false,
      },
      fallback: {
        path: false,
        fs: false,
        os: false,
      }
    },
    optimization: {
      minimize: env.prod,
      portableRecords: true,
      usedExports: true,
      providedExports: true
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  }
];
