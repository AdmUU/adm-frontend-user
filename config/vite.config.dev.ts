import { mergeConfig, loadEnv } from 'vite';
import eslint from "vite-plugin-eslint2";
import baseConfig from './vite.config.base';

const proxyApiPrefix = '/api';
const proxyStaticPrefix = '/static';
const proxyUploadPrefix = '/upload';
const proxySocketIOPrefix = '/socket.io';
const proxyManagePrefix = '/manage';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const port = parseInt(env.VITE_PORT || '9511', 10);
  const apiUrl = env.VITE_PROXY_API_URL || 'http://127.0.0.1:9501';
  const socketIOUrl = env.VITE_PROXY_SOCKETIO_URL || 'http://127.0.0.1:9503';
  const manageUrl = env.VITE_PROXY_MANAGE_URL || 'http://127.0.0.1:9512';

  return mergeConfig(
    {
      mode: 'development',
      server: {
        host: '0.0.0.0',
        port,
        proxy: {
          [proxyApiPrefix]: {
            target: apiUrl,
            changeOrigin: true,
            toProxy: true,
            rewrite: (path) =>
              path.replace(new RegExp(`^${proxyApiPrefix}`), ''),
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
            target: socketIOUrl,
            changeOrigin: true,
            ws: true,
            toProxy: true,
          },
          [proxyStaticPrefix]: {
            target: `${apiUrl}/static`,
            changeOrigin: true,
            toProxy: true,
            rewrite: (path) =>
              path.replace(new RegExp(`^${proxyStaticPrefix}`), ''),
          },
          [proxyUploadPrefix]: {
            target: `${apiUrl}/upload`,
            changeOrigin: true,
            toProxy: true,
            rewrite: (path) =>
              path.replace(new RegExp(`^${proxyUploadPrefix}`), ''),
          },
          [proxyManagePrefix]: {
            target: `${manageUrl}/manage`,
            changeOrigin: true,
            toProxy: true,
            rewrite: (path) =>
              path.replace(new RegExp(`^${proxyManagePrefix}`), ''),
          },
        },
        open: false,
        fs: {
          strict: true,
        },
        allowedHosts: [
          'localhost',
          '127.0.0.1',
          '.admin.im',
        ],
      },
      plugins: [
        eslint(),
      ],
    },
    baseConfig
  );
};
