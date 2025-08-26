import { mergeConfig } from 'vite'
import baseConfig from './vite.config.base'
import configVisualizerPlugin from './plugin/visualizer'
import configArcoResolverPlugin from './plugin/arcoResolver';

export default mergeConfig(
  {
    mode: 'production',
    plugins: [
      configVisualizerPlugin(),
      configArcoResolverPlugin(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-ui': ['vue', '@arco-design/web-vue'],
            'vue-ecosystem': ['vue-router', 'pinia', '@vueuse/core', 'vue-i18n'],
            'charts': ['echarts', 'vue-echarts']
          },
        },
      },
      chunkSizeWarningLimit: 2000,
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
  baseConfig
);
