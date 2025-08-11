import { ref } from 'vue';
import useSocket from '@/utils/socketio';
import axios, { AxiosRequestConfig } from 'axios';
import tool from '@/utils/tool';
import { nodeList, tcpPingDataMap } from '../node/node';

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
  type: string;
  content: string;
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
    .post('/plugin/webspeed/requestTask', null, config)
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
    'response-webspeed',
    (message: {
      ip: string;
      location: string;
      totalTime: number;
      httpCode: number;
      redirectCount: number;
      redirectTime: number;
      dnsTime: number;
      connectTime: number;
      sslTime: number;
      waitTime: number;
      downloadTime: number;
      downloadSize: number;
      downloadSpeed: number;
      httpHeaders: string;
      sid: string;
      did: string;
    }) => {
      lastMessage.value = message;

      if (message.ip) {
        nodeList.value[
          tcpPingDataMap.value[message.did]
        ].response_ip = `${message.ip}`;

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
      if (message.httpCode !== undefined) {
        if (!taskQueue[`${params.token}`]) {
          taskQueue[`${params.token}`] = [message.did];
          taskTimerId = setTimeout(() => {
            singleTaskEnd.value = true;
            socket.disconnect();
          }, 3000);
        } else {
          taskQueue[`${params.token}`].push(message.did);
        }
        nodeList.value[tcpPingDataMap.value[message.did]].status_code =
          message.httpCode;
        if (message.httpCode !== -1) {
          nodeList.value[tcpPingDataMap.value[message.did]].response_time =
            message.totalTime;
          nodeList.value[tcpPingDataMap.value[message.did]].redirects =
            message.redirectCount;
          nodeList.value[tcpPingDataMap.value[message.did]].redirect_time =
            message.redirectTime;
          nodeList.value[tcpPingDataMap.value[message.did]].resolution_time =
            message.dnsTime;
          nodeList.value[tcpPingDataMap.value[message.did]].connection_time =
            message.connectTime;
          nodeList.value[tcpPingDataMap.value[message.did]].ssl_handshake_time =
            message.sslTime;
          nodeList.value[tcpPingDataMap.value[message.did]].download_time =
            message.downloadTime + message.waitTime;
          nodeList.value[tcpPingDataMap.value[message.did]].download_size =
            message.downloadSize;
          nodeList.value[tcpPingDataMap.value[message.did]].download_speed =
            message.downloadSpeed;
          nodeList.value[tcpPingDataMap.value[message.did]].http_headers =
            message.httpHeaders;
          nodeList.value[tcpPingDataMap.value[message.did]].expand =
            message.httpHeaders;
        }
        if (taskQueue[`${params.token}`].length === nodeList.value.length) {
          singleTaskEnd.value = true;
          clearTimeout(taskTimerId);
          taskTimerId = null;
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
  const sendMessage = (event: string, message: any) => {
    socket.emit(event, message);
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
};
export default socketio;
