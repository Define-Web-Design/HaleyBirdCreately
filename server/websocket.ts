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

// Initialize WebSocket server on the HTTP server
export function initializeWebSocketServer(server: Server) {
  if (!server) {
    console.error('Cannot initialize WebSocket server: HTTP server not provided');
    return null;
  }
  
  // Use the same HTTP server for WebSockets to avoid port conflicts
  // Create a path-based WebSocket server to avoid conflicts with Vite
  const wss = new WebSocketServer({ 
    server,
    path: '/ws-api'  // Use a specific path for our WebSocket connections
  });
  console.log('WebSocket server initialized with path: /ws-api');

  wss.on('connection', (ws) => {
    const clientId = generateClientId();
    
    // Store client with WebSocket connection and empty subscriptions
    clients.set(clientId, {
      ws: ws,
      subscriptions: {},
      connectedAt: new Date().toISOString()
    });
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      payload: { 
        clientId,
        message: 'WebSocket connection established successfully',
        timestamp: new Date().toISOString()
      }
    }));

    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString()) as WebSocketMessage;
        console.log(`Received WebSocket message from ${clientId}: ${parsedMessage.type}`);
        
        // Handle different message types
        switch (parsedMessage.type) {
          case 'subscribe_tasks':
            // Get the current client data
            const clientData = clients.get(clientId) || { ws, subscriptions: {} };
            
            // Update subscriptions for this client
            clients.set(clientId, {
              ...clientData,
              subscriptions: {
                ...(clientData.subscriptions || {}),
                tasks: true
              },
              lastActivity: new Date().toISOString()
            });
            
            // Confirm subscription
            ws.send(JSON.stringify({
              type: 'subscription_confirmed',
              payload: { 
                topic: 'tasks',
                timestamp: new Date().toISOString()
              }
            }));
            break;
            
          case 'subscribe_notifications':
            // Get the current client data
            const notifClientData = clients.get(clientId) || { ws, subscriptions: {} };
            
            // Update subscriptions for this client
            clients.set(clientId, {
              ...notifClientData,
              subscriptions: {
                ...(notifClientData.subscriptions || {}),
                notifications: true
              },
              lastActivity: new Date().toISOString()
            });
            
            // Confirm subscription
            ws.send(JSON.stringify({
              type: 'subscription_confirmed',
              payload: { 
                topic: 'notifications',
                timestamp: new Date().toISOString()
              }
            }));
            break;
            
          default:
            console.log(`Received unknown message type: ${parsedMessage.type}`);
            ws.send(JSON.stringify({
              type: 'error',
              payload: { 
                message: `Unknown message type: ${parsedMessage.type}`,
                timestamp: new Date().toISOString()
              }
            }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { 
            message: 'Error processing message',
            timestamp: new Date().toISOString()
          }
        }));
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
  let sentCount = 0;
  let errorCount = 0;
  
  clients.forEach((clientData, clientId) => {
    // Handle both cases: when client data is the WebSocket itself or an object with WebSocket and metadata
    const ws = clientData.send ? clientData : clientData.ws;
    const subscriptions = clientData.subscriptions || {};
    
    // Only send to clients that are subscribed to this topic and are in the OPEN state
    if (subscriptions[topic] && ws && ws.readyState === 1) {
      try {
        ws.send(messageStr);
        sentCount++;
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error);
        errorCount++;
      }
    }
  });
  
  if (sentCount > 0 || errorCount > 0) {
    console.log(`Broadcast "${message.type}" to ${sentCount} clients (${errorCount} errors)`);
  }
}