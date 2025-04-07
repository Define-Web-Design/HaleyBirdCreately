/**
 * WebSocket Client for Real-time Updates
 * 
 * This module provides a WebSocket client implementation for the application,
 * enabling real-time updates for task statuses, notifications, and other features.
 */

type WebSocketMessageHandler = (data: any) => void;

interface WebSocketMessage {
  type: string;
  payload?: any;
}

class WebSocketClient {
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20; // Increased for better resilience
  private reconnectTimeout: number = 1000; // Start with 1 second timeout
  private reconnectTimer: any = null;
  private messageHandlers: Record<string, WebSocketMessageHandler[]> = {};
  private clientId: string | null = null;
  
  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (this.socket) {
      this.close();
    }

    // Use the same server but with a specific path for our WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // Host includes both hostname and port
    const wsUrl = `${protocol}//${host}/ws-api`; // Use the specific WebSocket path
    
    try {
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.attemptReconnect();
    }
  }
  
  /**
   * Close the WebSocket connection
   */
  close() {
    // Clear any reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  /**
   * Send a message to the WebSocket server
   * @param type Message type
   * @param payload Optional message payload
   */
  send(type: string, payload?: any) {
    if (!this.isConnected) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }
    
    const message: WebSocketMessage = { type, payload };
    this.socket?.send(JSON.stringify(message));
  }
  
  /**
   * Subscribe to updates for a specific entity type
   * @param entityType The type of entity to subscribe to (e.g., 'tasks', 'notifications')
   */
  subscribe(entityType: string) {
    this.send(`subscribe_${entityType}`);
  }
  
  /**
   * Add a message handler for a specific message type
   * @param messageType The type of message to handle
   * @param handler The handler function
   */
  on(messageType: string, handler: WebSocketMessageHandler) {
    if (!this.messageHandlers[messageType]) {
      this.messageHandlers[messageType] = [];
    }
    
    this.messageHandlers[messageType].push(handler);
    return this; // Allow chaining
  }
  
  /**
   * Remove a message handler
   * @param messageType The type of message
   * @param handler The handler to remove (optional - if not provided, removes all handlers for this type)
   */
  off(messageType: string, handler?: WebSocketMessageHandler) {
    if (!this.messageHandlers[messageType]) {
      return;
    }
    
    if (handler) {
      const index = this.messageHandlers[messageType].indexOf(handler);
      if (index !== -1) {
        this.messageHandlers[messageType].splice(index, 1);
      }
    } else {
      // Remove all handlers for this message type
      delete this.messageHandlers[messageType];
    }
  }
  
  /**
   * Get the connection status
   */
  get connected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Get the client ID assigned by the server
   */
  get id(): string | null {
    return this.clientId;
  }
  
  // Handle WebSocket open event
  private handleOpen(event: Event) {
    console.log('WebSocket connection established');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = 1000; // Reset timeout on successful connection
    
    // Notify listeners
    this.notifyHandlers('connection_open', { 
      connected: true,
      timestamp: new Date().toISOString(),
      reconnectAttempts: this.reconnectAttempts 
    });
  }
  
  // Handle WebSocket message event
  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      
      // Store client ID if received
      if (message.type === 'connection_established' && message.payload?.clientId) {
        this.clientId = message.payload.clientId;
      }
      
      // Notify handlers for this message type
      this.notifyHandlers(message.type, message.payload);
      
      // Also notify generic message handlers
      this.notifyHandlers('message', message);
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }
  
  // Handle WebSocket close event
  private handleClose(event: CloseEvent) {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.isConnected = false;
    
    // Get a human-readable description of the close code
    let statusDescription = 'Unknown';
    
    switch (event.code) {
      case 1000:
        statusDescription = 'Normal closure';
        break;
      case 1001:
        statusDescription = 'Going away';
        break;
      case 1002:
        statusDescription = 'Protocol error';
        break;
      case 1003:
        statusDescription = 'Unsupported data';
        break;
      case 1006:
        statusDescription = 'Abnormal closure';
        break;
      case 1007:
        statusDescription = 'Invalid frame payload data';
        break;
      case 1008:
        statusDescription = 'Policy violation';
        break;
      case 1009:
        statusDescription = 'Message too big';
        break;
      case 1010:
        statusDescription = 'Missing extension';
        break;
      case 1011:
        statusDescription = 'Internal error';
        break;
      case 1012:
        statusDescription = 'Service restart';
        break;
      case 1013:
        statusDescription = 'Try again later';
        break;
      case 1015:
        statusDescription = 'TLS handshake failure';
        break;
    }
    
    // Notify listeners with comprehensive information
    this.notifyHandlers('connection_close', { 
      connected: false, 
      code: event.code, 
      reason: event.reason || 'No reason provided',
      description: statusDescription,
      timestamp: new Date().toISOString(),
      willReconnect: event.code !== 1000,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    });
    
    // Attempt to reconnect unless this was a normal closure
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }
  
  // Handle WebSocket error event
  private handleError(event: Event) {
    console.error('WebSocket error:', event);
    
    // Notify listeners with meaningful error information
    this.notifyHandlers('connection_error', { 
      timestamp: new Date().toISOString(),
      connected: false,
      message: 'A WebSocket error occurred. The connection might be unstable.',
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      willAttemptReconnect: this.reconnectAttempts < this.maxReconnectAttempts
    });
  }
  
  // Notify all handlers for a specific message type
  private notifyHandlers(messageType: string, data: any) {
    const handlers = this.messageHandlers[messageType] || [];
    
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in WebSocket message handler for '${messageType}':`, error);
      }
    });
  }
  
  // Attempt to reconnect to the WebSocket server
  private attemptReconnect() {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnection attempts reached. Giving up.');
      // Notify listeners that reconnection has failed permanently
      this.notifyHandlers('reconnection_failed', {
        timestamp: new Date().toISOString(),
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        message: 'WebSocket reconnection failed after maximum attempts. Please refresh the page.'
      });
      return;
    }
    
    this.reconnectAttempts++;
    
    // Exponential backoff with jitter
    const jitter = Math.random() * 0.3 + 0.85; // Random between 0.85 and 1.15
    const timeout = this.reconnectTimeout * jitter;
    
    console.log(`Attempting to reconnect in ${Math.round(timeout)}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    // Notify listeners about reconnection attempt
    this.notifyHandlers('reconnection_attempt', {
      timestamp: new Date().toISOString(),
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      timeout: Math.round(timeout),
      nextAttemptAt: new Date(Date.now() + timeout).toISOString()
    });
    
    // Store the timer reference so we can cancel it if needed
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, timeout);
    
    // Increase timeout for next attempt (exponential backoff with upper bound)
    this.reconnectTimeout = Math.min(30000, this.reconnectTimeout * 2);
  }
}

// Create a singleton instance
const webSocketClient = new WebSocketClient();

export default webSocketClient;