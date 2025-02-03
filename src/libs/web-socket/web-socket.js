import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscription = null;
    this.isConnected = false;
  }

  connect(onConnected, onError) {
    try {
      // Tạo URL đầy đủ cho SockJS endpoint
      const serverUrl = `http://localhost:8080/ws`;
      
      // Tạo SockJS connection
      const socket = new SockJS(serverUrl);
      
      // Tạo STOMP client qua SockJS
      this.stompClient = Stomp.over(socket);

      // Disable STOMP debug logging nếu cần
      // this.stompClient.debug = () => {};

      // Connect với STOMP
      this.stompClient.connect(
        {},
        () => {
          this.isConnected = true;
          console.log('WebSocket Connected!');
          if (onConnected) onConnected();
        },
        (error) => {
          console.error('STOMP Error:', error);
          this.isConnected = false;
          if (onError) onError(error);
        }
      );

    } catch (error) {
      console.error('Connection error:', error);
      if (onError) onError(error);
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.isConnected = false;
    }
  }

  subscribeToBarTableStatus(onMessageReceived) {
    if (!this.isConnected || !this.stompClient) {
      console.error('WebSocket is not connected');
      return null;
    }

    try {
      const subscription = this.stompClient.subscribe('/topic/bar-tables', (message) => {
        try {
          const response = JSON.parse(message.body);
          // Kiểm tra callback trước khi gọi
          if (typeof onMessageReceived === 'function') {
            onMessageReceived(response);
          } else {
            console.warn('onMessageReceived is not a function');
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to bar table status:', error);
      return null;
    }
  }

  sendBarTableStatusViewRequest(request) {
    if (!this.isConnected || !this.stompClient) {
      console.error('WebSocket is not connected');
      return;
    }

    this.stompClient.send(
      '/app/bar-table/status-view',
      {},
      JSON.stringify(request)
    );
  }

  sendBarTableStatusUpdateRequest(request) {
    if (!this.isConnected || !this.stompClient) {
      console.error('WebSocket is not connected');
      return;
    }

    this.stompClient.send(
      '/app/bar-table/status-update',
      {},
      JSON.stringify({
        ...request,
        userEmail: request.userEmail
      })
    );
  }

  isWebSocketConnected() {
    return this.isConnected;
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
