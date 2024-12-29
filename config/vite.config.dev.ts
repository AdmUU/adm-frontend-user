import { mergeConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import baseConfig from './vite.config.base'

const proxyApiPrefix = '/api';
const proxyStaticPrefix = '/static';
const proxyUploadPrefix = '/upload';
const proxySocketIOPrefix = '/socket.io';
export default mergeConfig(
  {
    mode: 'development',
    server: {
      host: '0.0.0.0',
      port: 2999,
      proxy: {
        [proxyApiPrefix]: {
          target: 'http://127.0.0.1:9501',
          changeOrigin: true,
          toProxy: true,
          rewrite: (path) => path.replace(new RegExp(`^${proxyApiPrefix}`), ''),
          cookieDomainRewrite: {
            '*': '',
          },
          cookiePathRewrite: {
            '*': '/',
          },
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        },
        [proxySocketIOPrefix]: {
          target: 'http://127.0.0.1:9503',
          changeOrigin: true,
          ws: true,
          toProxy: true,
        },
        [proxyStaticPrefix]: {
          target: 'http://127.0.0.1:9501/static',
          changeOrigin: true,
          toProxy: true,
          rewrite: (path) =>
            path.replace(new RegExp(`^${proxyStaticPrefix}`), ''),
        },
        [proxyUploadPrefix]: {
          target: 'http://127.0.0.1:9501/upload',
          changeOrigin: true,
          toProxy: true,
          rewrite: (path) =>
            path.replace(new RegExp(`^${proxyUploadPrefix}`), ''),
        },
      },
      open: false,
      fs: {
        strict: true,
      },
    },
    plugins: [
      eslint({
        cache: true,
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
        exclude: ['node_modules'],
      }),
    ],
  },
  baseConfig
);
