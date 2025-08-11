import i18n from '@/locale';
import sysI18nEnUS from '@/locale/en-US';
import sysI18nZhCN from '@/locale/zh-CN';
import sysI18nZhTW from '@/locale/zh-TW';
import router from '@/router/index';
import useMenuBarStore from '@/store/modules/menu-bar';
import { IconDashboard } from '@arco-design/web-vue/es/icon';
import pluginI18nEnUS from './locale/en-US';
import pluginI18nZhCN from './locale/zh-CN';
import pluginI18nZhTW from './locale/zh-TW';

const { t } = i18n.global;
export default {
  name: 'Adm Website Speedtest',
  version: '1.0.0',
  description: 'Adm Website Speedtest Plugin',
  install: () => {
    const menuBar = useMenuBarStore();
    menuBar.addMenu({
      key: 'webspeed',
      label: t('navbar.menu.title.webspeed'),
      icon: IconDashboard,
    });
    router.isReady().then(() => {
      router.addRoute({
        name: 'webspeed',
        path: '/webspeed',
        component: () => import('./views/index.vue'),
        meta: {
          title: t('navbar.menu.title.webspeed'),
          key: 'webspeed',
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
