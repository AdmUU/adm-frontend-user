import { createApp, h } from 'vue';
import i18n from '@/locale';
import sysI18n from '@/locale/zh-CN';
import Captcha from './components/captcha.vue';
import pluginI18n from './i18n/zh_CN/plugin';

let instance = null;

const captcha = (option = null) => {
  return new Promise((resolve, reject) => {
    if (instance) {
      reject(new Error('Cannot be called repeatedly'));
      return;
    }
    const container = document.createElement('div');
    document.body.appendChild(container);
    const app = createApp({
      render() {
        return h(Captcha, {
          visible: true,
          ...(option || {}),
          onClose: (res) => {
            // 先卸载
            app.unmount();
            document.body.removeChild(container);
            instance = null;
            resolve(res);
          },
        });
      },
    });
    app.use(i18n);
    instance = app.mount(container);
  });
};

// 导出函数供外部调用
export { captcha };

// 暂时就只有中文的
export default {
  install: () => {
    if (
      (import.meta.env.VITE_APP_CAPTCHA_NOT_REPLACE_LOGIN || false) === false
    ) {
      // 替换路由
      // router.removeRoute('login');
      // router.addRoute({
      //   name: 'login',
      //   path: '/login',
      //   component: () => import('./views/login.vue'),
      //   meta: { title: '登录' },
      // });
      // router.replace(router.currentRoute.value.fullPath);
    }
    Object.assign(sysI18n.plugin, pluginI18n);
  },
};
