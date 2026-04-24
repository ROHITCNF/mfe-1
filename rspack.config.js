// @ts-check
import { defineConfig } from '@rspack/cli';
import { rspack } from '@rspack/core';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

const isDev = process.env.NODE_ENV === 'development';

/** Remote name: use in host as `mfe1@http://localhost:3001/remoteEntry.js` */
const MF_NAME = 'mfe1';

export default defineConfig({
  entry: {
    main: './src/main.jsx',
  },
  target: ['browserslist:last 2 versions, > 0.2%, not dead, Firefox ESR'],
  output: {
    publicPath: 'auto',
    uniqueName: MF_NAME,
  },
  devServer: {
    port: 3001,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  resolve: {
    extensions: ['...', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
      },
      {
        test: /\.css$/,
        type: 'css/auto',
      },
      {
        test: /\.(?:js|jsx|mjs|cjs)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            /** @type {import('@rspack/core').SwcLoaderOptions} */
            options: {
              detectSyntax: 'auto',
              jsc: {
                transform: {
                  react: {
                    runtime: 'automatic',
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: MF_NAME,
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.jsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^19.0.0',
        },
      },
    }),
    new rspack.HtmlRspackPlugin({
      template: './index.html',
    }),
    isDev && new ReactRefreshRspackPlugin(),
  ].filter(Boolean),
});
