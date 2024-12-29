import { ref, computed } from 'vue';
import usePingHistoryStore from '@/store/plugin/ping/history';

export const pingHistory = usePingHistoryStore();
export const inputHost = ref('');
export const inputDisable = ref(false);

/**
 * Filter history data
 * @returns
 */
export const filteredHistory = computed(() => {
  if (inputDisable.value === true) return null;
  const historys = pingHistory.data
    .filter((history) => history.includes(inputHost.value))
    .map((history) => ({ value: history.slice(0, 3380) }));
  return historys;
});

/**
 * Handle ping history
 * @param host
 * @returns
 */
export const handlePingHistory = (host: string) => {
  inputHost.value = host;
};

/**
 * Remove a history record
 * @param history
 * @returns
 */
export const removeHistory = (history: string) => {
  const index = pingHistory.data.indexOf(history);
  if (index > -1) {
    pingHistory.data.splice(index, 1);
  }
};
