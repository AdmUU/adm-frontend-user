import { ref } from 'vue';
import io from 'socket.io-client';

export default function useSocket() {
  const socketClient = ref<SocketIOClient.Socket | null>(null);

  const initializeSocket = (url: string, token: string) => {
    if (socketClient.value && socketClient.value.connected) {
      socketClient.value.disconnect();
    }

    const locale = localStorage.getItem('arco-locale') || 'zh-CN';
    socketClient.value = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionDelayMax: 10000,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      query: { token, locale },
    });

    socketClient.value.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error.message);
    });
    socketClient.value.on('error', (error: { message: any }) => {
      console.log('Socket error:', error.message);
    });
    return socketClient.value;
  };

  return {
    socketClient,
    initializeSocket,
  };
}
