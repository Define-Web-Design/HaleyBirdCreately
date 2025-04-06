import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { storage } from './storage'; // Import the storage instance instead of the type

// Define message types for WebSocket communication
export interface WebSocketMessage {
  type: string;
  payload?: any;
}

// Store connected clients
const clients = new Map();

// Initialize WebSocket server on a different port to avoid conflict with Vite
export function initializeWebSocketServer(server?: Server) {
  // Use a dedicated port for WebSocket to avoid conflict with Vite's WebSocket
  const wss = new WebSocketServer({ port: 5001 });
  console.log('WebSocket server started on port 5001');

  wss.on('connection', (ws) => {
    const clientId = generateClientId();
    clients.set(clientId, ws);
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      payload: { clientId }
    }));

    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as WebSocketMessage;
        
        // Handle different message types
        switch (parsedMessage.type) {
          case 'subscribe_tasks':
            // Store subscription information with the client
            clients.set(clientId, {
              ...clients.get(clientId),
              subscriptions: {
                ...(clients.get(clientId)?.subscriptions || {}),
                tasks: true
              }
            });
            break;
            
          case 'subscribe_notifications':
            clients.set(clientId, {
              ...clients.get(clientId),
              subscriptions: {
                ...(clients.get(clientId)?.subscriptions || {}),
                notifications: true
              }
            });
            break;
            
          default:
            console.log(`Received unknown message type: ${parsedMessage.type}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    // Handle client disconnection
    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${clientId}`);
      clients.delete(clientId);
    });
  });

  console.log('WebSocket server initialized');
  return wss;
}

// Generate a unique client ID
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Broadcast task updates to subscribed clients
export function broadcastTaskUpdate(taskData: any): void {
  const message: WebSocketMessage = {
    type: 'task_update',
    payload: taskData
  };
  
  broadcastToSubscribers('tasks', message);
}

// Broadcast notification to subscribed clients
export function broadcastNotification(notification: any): void {
  const message: WebSocketMessage = {
    type: 'notification',
    payload: notification
  };
  
  broadcastToSubscribers('notifications', message);
}

// Broadcast message to clients subscribed to a specific topic
function broadcastToSubscribers(topic: string, message: WebSocketMessage): void {
  const messageStr = JSON.stringify(message);
  
  clients.forEach((client, clientId) => {
    const subscriptions = client.subscriptions || {};
    
    if (subscriptions[topic] && client.readyState === 1) {
      try {
        client.send(messageStr);
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error);
      }
    }
  });
}