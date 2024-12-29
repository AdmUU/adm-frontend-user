import { defineStore } from 'pinia';
import { CaptchaProps } from './types';

const maxHistory = 20;
const useApiCaptchaStore = defineStore('apiCaptcha', {
  state: () => ({
    urlSet: [] as string[],
    visible: false,
    props: { captcha_type: 0 } as CaptchaProps,
    errMsgShowTime: 0,
  }),
  actions: {
    addUrl(item: string) {
      item = item.slice(0, 200);
      const index = this.urlSet.indexOf(item);
      if (index !== -1) {
        return;
      }
      this.urlSet.unshift(item);
      if (this.urlSet.length > maxHistory) {
        this.urlSet.pop();
      }
    },
    reset() {
      this.$reset();
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'apiCaptcha',
        storage: localStorage,
      },
    ],
  },
});

export default useApiCaptchaStore;
