import { defineStore } from 'pinia';
import logoFile from '@/assets/image/blank.png';
import { SiteConfig } from './types';

const useSiteConfigStore = defineStore('siteConfig', {
  state: (): SiteConfig => ({
    site_name: '',
    site_subtitle: '',
    site_logo: logoFile,
    site_copyright: '',
    site_record_number: '',
    index_banner: '',
    enable_ping_china_map: '',
  }),
  actions: {
    updateConfig(config: Partial<SiteConfig>) {
      Object.assign(this, config);
    },
    reset() {
      this.$reset();
    },
  },
});

export default useSiteConfigStore;
