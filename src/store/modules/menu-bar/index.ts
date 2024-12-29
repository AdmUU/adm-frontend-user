import { defineStore } from 'pinia';
import { MenuItem } from './types';

const useMenuBarStore = defineStore('menuBar', {
  state: () => ({
    menuList: [] as MenuItem[],
  }),
  getters: {
    list(): MenuItem[] {
      if (import.meta.env.VITE_ADM_MENU_ORDER) {
        const order = import.meta.env.VITE_ADM_MENU_ORDER.split(',');
        return this.menuList.sort((a, b) => {
          return order.indexOf(a.key) - order.indexOf(b.key);
        });
      }
      return this.menuList;
    },
  },
  actions: {
    addMenu(menu: MenuItem) {
      if (this.menuList.some((item) => item.key === menu.key)) {
        return;
      }
      this.menuList.push(menu);
    },
  },
});

export default useMenuBarStore;
