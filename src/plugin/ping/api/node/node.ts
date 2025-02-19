import { ref } from 'vue';
import axios, { AxiosRequestConfig } from 'axios';

/**
 * Node record
 */
export interface NodeRecord {
  key: string;
  node_name: string;
  country: string;
  country_en?: string;
  province?: string;
  province_en?: string;
  isp?: string;
  isp_en?: string;
  response_ip?: string;
  response_ip_location?: string;
  response_time?: number;
  packet_loss?: number | string;
  packet_min?: number | string;
  packet_max?: number | string;
  packet_avg?: number | string;
}
export const nodeList = ref<NodeRecord[]>([]);

type PingDataMap = {
  [key: string]: number;
};

/**
 * Create a map of node IDs to their index in the node list.
 * @param tcpPingData
 * @returns
 */
const createTcpPingDataMap: (tcpPingData: NodeRecord[]) => PingDataMap = (
  tcpPingData
) => {
  const dataMap = tcpPingData.reduce((acc: PingDataMap, item, index) => {
    if (item.key) {
      acc[item.key] = index;
    }
    return acc;
  }, {});
  return dataMap;
};
export const tcpPingDataMap = ref<PingDataMap>({});

/**
 * Node list item
 */
interface ApiNodeItem {
  did: number;
  name: string;
  name_en: string;
  country: string;
  country_name: string;
  country_name_en: string;
  province: string;
  province_name: string;
  region: string;
  continent: string;
  isp: string;
  isp_name: string;
  isp_name_en: string;
  online_total_time: number | null;
  online_last_time: number | null;
  sponsor_name: string | null;
  ip: string;
}

/**
 * Query node list params
 */
export interface QueryNodeListParams {
  address_type?: string;
  dict_code?: string;
  dict_value?: string;
  task_type?: string;
  task_id?: string;
}

/**
 * Query node list
 * @param params
 * @returns
 */
export async function queryNodeList(
  params: QueryNodeListParams
): Promise<NodeRecord[]> {
  const config: AxiosRequestConfig = {
    params,
  };
  const response = await axios.get<ApiNodeItem[]>(
    '/adm/v1/getNodeList',
    config
  );
  const locale = localStorage.getItem('arco-locale') || 'zh-CN';
  nodeList.value = response.data.map((item) => ({
    key: item.did.toString(),
    node_name: locale === 'en-US' ? item.name_en : item.name,
    country: item.country_name,
    country_en: item.country_name_en,
    province: item.province_name,
    province_en: item.province,
    isp: item.isp_name,
    isp_en: item.isp_name_en,
    response_ip: '--',
    response_ip_location: '--',
    packet_min: '--',
    packet_max: '--',
    packet_avg: '--',
  }));
  tcpPingDataMap.value = createTcpPingDataMap(nodeList.value);
  return nodeList.value;
}
