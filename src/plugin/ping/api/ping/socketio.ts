import { ref } from 'vue';
import useSocket from '@/utils/socketio';
import axios, { AxiosRequestConfig } from 'axios';
import tool from '@/utils/tool';
import {
  nodeList,
  tcpPingDataMap,
  singleTaskLoading,
  continuousTaskLoading,
  taskLoadingTimerId
} from '../node/node';
import { initCanvas, pingChartCanvas } from '../node/canvas';

type DelaySet = {
  [key: string]: number[];
};

type DelayNum = {
  [key: string]: number;
};

/**
 * Request Socket Data
 */
export interface RequestSocketData {
  websocket_address: string;
  node_type: string;
  //  host: string;
  token: string;
  task_id: string;
}

/**
 * Response IPs set
 */
export interface ResponseIPs {
  all: string[];
  ipv4: string[];
  ipv6: string[];
  port: number | null;
}

/**
 * Request Socket Params
 */
interface RequestSocketParams {
  client_type: string;
  ping_protocol: string;
  ping_type: string;
  host: string;
}

/**
 * Request Socket
 * @param params
 * @returns
 */
export async function requestSocket(
  params: RequestSocketParams
): Promise<RequestSocketData> {
  const config: AxiosRequestConfig = {
    params,
  };
  const requestSocketData: RequestSocketData = {
    websocket_address: '/web',
    node_type: '',
    token: '',
    task_id: '',
  };

  await axios
    .post('/plugin/ping/requestTask', null, config)
    .then((response) => {
      requestSocketData.token = response.data.token;
      requestSocketData.task_id = response.data.task_id;
      requestSocketData.node_type = response.data.node_type;
    })
    .catch((error) => {
      throw error;
    });
  return requestSocketData;
}

export const singleTaskEnd = ref(false);
export const responseIPAll = ref([]);
export const responseIPValid = ref<ResponseIPs>({
  all: [],
  ipv4: [],
  ipv6: [],
  port: null,
});
export const responseChinaIPValid = ref({
  all: [],
  ipv4: [],
  ipv6: [],
  port: null,
});

const nodeDelaySet: DelaySet = {};
const nodeDelaySum: DelayNum = {};
const nodeDelayLength: DelayNum = {};
const nodeDelayLoss: DelayNum = {};
let nodePingtype = '';

const { initializeSocket } = useSocket();
/**
 * SocketIO
 *
 * @param params
 * @returns
 */
const socketio = async (params: RequestSocketData) => {
  const isConnected = ref(false);
  const lastMessage = ref({});
  const socket = initializeSocket(params.websocket_address, params.token);
  const formatPacket = (packet: number) => {
    if (packet > 0 && packet < 1) return '<1';
    return Math.floor(packet);
  };
  const taskQueue = {};
  singleTaskEnd.value = false;
  responseIPAll.value = [];
  responseIPValid.value = { all: [], ipv4: [], ipv6: [], port: null };
  responseChinaIPValid.value = { all: [], ipv4: [], ipv6: [], port: null };
  let taskTimerId = null;
  socket.on('connect', () => {
    isConnected.value = true;
    Object.keys(nodeDelaySet).forEach((key) => delete nodeDelaySet[key]);
    Object.keys(nodeDelaySum).forEach((key) => delete nodeDelaySum[key]);
    Object.keys(nodeDelayLoss).forEach((key) => delete nodeDelayLoss[key]);
    Object.keys(nodeDelayLength).forEach((key) => delete nodeDelayLength[key]);
  });

  socket.on('disconnect', (reason: any) => {
    console.log('Disconnected:', reason);
    isConnected.value = false;
  });

  socket.on('message', (message: any) => {
    lastMessage.value = message;
    console.log('message:', message);
  });

  socket.on(
    'response-ping',
    (message: {
      ip: string;
      location: string;
      delay: number;
      sid: string;
      did: string;
    }) => {
      lastMessage.value = message;

      if (message.ip) {
        nodeList.value[
          tcpPingDataMap.value[message.did]
        ].response_ip = `${message.ip}`;
        nodeList.value[
          tcpPingDataMap.value[message.did]
        ].is_loading = false;

        if (!responseIPAll.value[`${message.ip}`]) {
          responseIPAll.value[`${message.ip}`] = tool.checkIP(message.ip);
        }

        if (responseIPAll.value[`${message.ip}`].isValid) {
          if (
            !responseIPValid.value.all.includes(
              responseIPAll.value[`${message.ip}`].ip
            )
          ) {
            responseIPValid.value.all.push(
              responseIPAll.value[`${message.ip}`].ip
            );
            if (responseIPAll.value[`${message.ip}`].type === 'IPv4') {
              responseIPValid.value.ipv4.push(
                responseIPAll.value[`${message.ip}`].ip
              );
            }
            if (responseIPAll.value[`${message.ip}`].type === 'IPv6') {
              responseIPValid.value.ipv6.push(
                responseIPAll.value[`${message.ip}`].ip
              );
            }
            if (responseIPAll.value[`${message.ip}`].port) {
              responseIPValid.value.port =
                responseIPAll.value[`${message.ip}`].port;
            }
          }

          if (
            nodeList.value[tcpPingDataMap.value[message.did]].country_en ===
              'China' &&
            !responseChinaIPValid.value.all.includes(
              responseIPAll.value[`${message.ip}`].ip
            )
          ) {
            responseChinaIPValid.value.all.push(
              responseIPAll.value[`${message.ip}`].ip
            );

            if (responseIPAll.value[`${message.ip}`].type === 'IPv4') {
              responseChinaIPValid.value.ipv4.push(
                responseIPAll.value[`${message.ip}`].ip
              );
            }
            if (responseIPAll.value[`${message.ip}`].type === 'IPv6') {
              responseChinaIPValid.value.ipv6.push(
                responseIPAll.value[`${message.ip}`].ip
              );
            }
            if (responseIPAll.value[`${message.ip}`].port) {
              responseChinaIPValid.value.port =
                responseIPAll.value[`${message.ip}`].port;
            }
          }
        }
      }
      if (message.location) {
        nodeList.value[
          tcpPingDataMap.value[message.did]
        ].response_ip_location = `${message.location}`;
      }

      if (message.delay !== undefined) {
        if (nodePingtype === 'continuous') {
          if (nodeDelaySet[message.did] === undefined) {
            nodeDelaySet[message.did] = [];
            nodeDelaySum[message.did] = 0;
            nodeDelayLoss[message.did] = 0;
            nodeDelayLength[message.did] = 0;
          }
          nodeDelayLength[message.did] += 1;
          if (message.delay > 0) {
            nodeDelaySet[message.did].push(message.delay);
          }
          nodeDelaySum[message.did] += message.delay;
          if (message.delay === 0) {
            nodeDelayLoss[message.did] += 1;
          }
          nodeList.value[tcpPingDataMap.value[message.did]].packet_min =
            nodeDelaySet[message.did] && nodeDelaySet[message.did].length > 0
              ? formatPacket(Math.min(...nodeDelaySet[message.did]))
              : '--';
          nodeList.value[tcpPingDataMap.value[message.did]].packet_max =
            nodeDelaySet[message.did] && nodeDelaySet[message.did].length > 0
              ? formatPacket(Math.max(...nodeDelaySet[message.did]))
              : '--';
          nodeList.value[tcpPingDataMap.value[message.did]].packet_loss =
            Math.floor(
              (nodeDelayLoss[message.did] / nodeDelayLength[message.did]) * 100
            );
          nodeList.value[tcpPingDataMap.value[message.did]].packet_avg =
            nodeDelaySet[message.did] && nodeDelaySet[message.did].length > 0
              ? formatPacket(
                  nodeDelaySum[message.did] / nodeDelaySet[message.did].length
                )
              : '--';

          initCanvas(pingChartCanvas[message.did], message.did, message.delay);
          if (!taskQueue[`${params.token}`]) {
            taskQueue[`${params.token}`] = [message.did];
            taskTimerId = setTimeout(() => {
              continuousTaskLoading.value = false;
            }, 5000);
          } else {
            taskQueue[`${params.token}`].push(message.did);
          }
        } else {
          if (!taskQueue[`${params.token}`]) {
            taskQueue[`${params.token}`] = [message.did];
            taskTimerId = setTimeout(() => {
              singleTaskEnd.value = true;
              singleTaskLoading.value = false;
              socket.disconnect();
            }, 3000);
          } else {
            taskQueue[`${params.token}`].push(message.did);
          }
          nodeList.value[tcpPingDataMap.value[message.did]].response_time =
            message.delay;
          if (taskQueue[`${params.token}`].length === nodeList.value.length) {
            singleTaskEnd.value = true;
            clearTimeout(taskTimerId);
            clearTimeout(taskLoadingTimerId.value);
            taskTimerId = null;
            singleTaskLoading.value = false;
            taskLoadingTimerId.value = null;
          }
        }
      }
    }
  );

  /**
   * Send Message
   *
   * @param event
   * @param message
   * @param pingtype
   * @returns
   */
  const sendMessage = (event: string, message: any, pingtype: string) => {
    nodePingtype = pingtype;
    socket.emit(event, message);
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
};
export default socketio;
