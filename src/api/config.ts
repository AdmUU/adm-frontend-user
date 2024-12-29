import { ref } from 'vue';
import axios from 'axios';

export interface SiteConfig {
  site_name: string;
  index_banner: string;
}
export const siteConfig = ref<SiteConfig>();

export async function getSiteConfig(): Promise<SiteConfig> {
  const response = await axios.get<SiteConfig>('/adm/v1/getSiteConfig');
  siteConfig.value = response.data;
  return siteConfig.value;
}
