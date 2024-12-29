import { defineStore } from 'pinia';

const maxHistory = 20;
const usePingHistoryStore = defineStore('pingHistory', {
  state: () => ({
    data: [] as string[],
  }),
  actions: {
    addItem(item: string) {
      item = item.slice(0, 60);
      const index = this.data.indexOf(item);
      if (index !== -1) {
        this.data.splice(index, 1);
      }

      this.data.unshift(item);

      if (this.data.length > maxHistory) {
        this.data.pop();
      }
    },
    setData(newData: string[]) {
      this.data = newData.slice(0, maxHistory);
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'pingHistory',
        storage: localStorage,
      },
    ],
  },
});

export default usePingHistoryStore;
