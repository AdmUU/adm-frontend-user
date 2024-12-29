import { App, Plugin } from 'vue';
import router from '@/router/index';

export default {
  install: (Vue: App) => {
    const pluginList: Record<string, () => Promise<any>> = import.meta.glob(
      './*/main.js'
    );
    Object.keys(pluginList).forEach((path) => {
      pluginList[path]().then((module) => {
        const plugin = module.default || module;
        if (typeof plugin === 'object' && 'install' in plugin) {
          Vue.use(plugin as Plugin);
        } else {
          console.warn(
            `Plugin at ${path} does not have a valid install method`
          );
        }
      });
    });

    const routeIndex = import.meta.env.VITE_ADM_ROUTE_INDEX;
    if (routeIndex) {
      router.isReady().then(() => {
        router.removeRoute('index');
        router.addRoute({
          name: 'index',
          path: '/',
          component: () => import(`@/plugin/${routeIndex}/views/index.vue`),
          meta: { key: routeIndex, requiresAuth: false },
        });
      });
    }
  },
};
