import i18n from '@/locale';
import sysI18nEnUS from '@/locale/en-US';
import sysI18nZhCN from '@/locale/zh-CN';
import sysI18nZhTW from '@/locale/zh-TW';
import router from '@/router/index';
import useMenuBarStore from '@/store/modules/menu-bar';
import { IconThunderbolt, IconRelation } from '@arco-design/web-vue/es/icon';
import pluginI18nEnUS from './locale/en-US';
import pluginI18nZhCN from './locale/zh-CN';
import pluginI18nZhTW from './locale/zh-TW';

const { t } = i18n.global;
export default {
  name: 'Adm Ping',
  version: '1.0.0',
  description: 'Adm Ping Plugin',
  install: () => {
    const menuBar = useMenuBarStore();
    menuBar.addMenu({
      key: 'ping',
      label: t('navbar.menu.title.ping'),
      icon: IconThunderbolt,
    });
    menuBar.addMenu({
      key: 'tcping',
      label: t('navbar.menu.title.tcping'),
      icon: IconRelation,
    });
    router.isReady().then(() => {
      router.addRoute({
        name: 'ping',
        path: '/ping',
        meta: {
          title: t('navbar.menu.title.ping'),
          description: 'Server Ping',
          key: 'ping',
          requiresAuth: false,
        },
        component: () => import('./views/index.vue'),
      });
      router.addRoute({
        name: 'tcping',
        path: '/tcping',
        component: () => import('./views/index.vue'),
        meta: {
          title: t('navbar.menu.title.tcping'),
          key: 'tcping',
          requiresAuth: false,
        },
      });
      router.replace(router.currentRoute.value.fullPath);
    });

    Object.assign(sysI18nEnUS.plugin, pluginI18nEnUS);
    Object.assign(sysI18nZhCN.plugin, pluginI18nZhCN);
    Object.assign(sysI18nZhTW.plugin, pluginI18nZhTW);
  },
};
