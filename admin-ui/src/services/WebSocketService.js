let wsInstance = null;

export const initializeWebSocket = (url, onMessage, onError, onClose) => {
  if (!wsInstance) {
    wsInstance = new WebSocket(url);

    wsInstance.onopen = () => {
      console.log("WebSocket connection established");
    };

    wsInstance.onmessage = (event) => {
      if (onMessage) {
        onMessage(JSON.parse(event.data));
      }
    };

    wsInstance.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (onError) onError(error);
    };

    wsInstance.onclose = () => {
      console.log("WebSocket connection closed");
      if (onClose) onClose();
      wsInstance = null; // Reset the instance on close
    };
  }
};

export const sendWebSocketMessage = (message) => {
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    wsInstance.send(JSON.stringify(message));
  }
};

export const closeWebSocket = () => {
  if (wsInstance) {
    wsInstance.close();
    wsInstance = null;
  }
};

export const isWebSocketConnected = () =>
  wsInstance && wsInstance.readyState === WebSocket.OPEN;
