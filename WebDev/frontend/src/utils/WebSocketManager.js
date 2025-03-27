// 📄 src/utils/WebSocketManager.js
class WebSocketManager {
    constructor(url, onMessage) {
      this.url = url;
      this.socket = null;
      this.onMessage = onMessage;
    }
  
    // --- Connect to WebSocket ---
    connect() {
      if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
        this.socket = new WebSocket(this.url);
  
        this.socket.onopen = () => {
          console.log("✅ WebSocket connected!");
        };
  
        this.socket.onmessage = (event) => {
          if (this.onMessage) {
            this.onMessage(event.data);
          }
        };
  
        this.socket.onerror = (error) => {
          console.error("⚠️ WebSocket error:", error);
        };
  
        this.socket.onclose = () => {
          console.log("❌ WebSocket disconnected!");
        };
      }
    }
  
    // --- Send frame/screenshot to server ---
    send(data) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(data);
      }
    }
  
    // --- Close WebSocket ---
    disconnect() {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    }
  }
  
  export default WebSocketManager;
  