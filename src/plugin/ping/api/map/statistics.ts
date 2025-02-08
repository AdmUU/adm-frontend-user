import { ref } from 'vue';
import { NodeRecord, nodeList } from '../node/node';

/**
 * Top Nodes
 */
export interface TopNodes {
  key: string;
  country: string;
  node_name: string;
  response_time_avg: number | string;
}

/**
 * Bgp Delay
 */
export interface BgpDelay {
  key: string;
  bgp_name: string;
  bgp_name_cn: string;
  response_time_avg: number | string;
}

/**
 * Stat Node
 */
export interface StatNode {
  name: string;
  name_en: string;
  packet_min: number;
  packet_max: number;
  packet_avg: number;
  list: NodeRecord[];
}

export type MapStatNodes = StatNode[];
