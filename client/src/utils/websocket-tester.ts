
/**
 * WebSocket testing utility
 * Tests reliability, connection handling, and reconnection logic
 */

interface WebSocketTestResult {
  success: boolean;
  connectionEstablished: boolean;
  messagesSent: number;
  messagesReceived: number;
  reconnectionAttempts: number;
  reconnectionSuccessful: boolean;
  errors: string[];
  averageLatency: number | null;
}

export class WebSocketTester {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeouts: number[] = [300, 1000, 2000, 5000, 10000]; // Exponential backoff
  private messagesSent = 0;
  private messagesReceived = 0;
  private errors: string[] = [];
  private latencies: number[] = [];
  private messageSendTimes: Map<string, number> = new Map();
  private reconnectionSuccessful = false;
  private testInProgress = false;
  
  /**
   * Test WebSocket connection and reliability
   */
  async testWebSocketConnection(url: string, testDurationMs: number = 10000): Promise<WebSocketTestResult> {
    if (this.testInProgress) {
      throw new Error('A WebSocket test is already in progress');
    }
    
    this.testInProgress = true;
    this.resetState();
    
    return new Promise((resolve) => {
      console.log(`Starting WebSocket test for ${url} (${testDurationMs}ms)`);
      
      // Setup WebSocket
      this.setupWebSocket(url);
      
      // Set up ping interval
      const pingInterval = setInterval(() => {
        this.sendPing();
      }, 1000);
      
      // Schedule connection drop test (halfway through the test)
      const dropTimeout = setTimeout(() => {
        console.log('Testing reconnection - forcing connection drop');
        this.forceConnectionDrop();
      }, testDurationMs / 2);
      
      // End test after specified duration
      const endTimeout = setTimeout(() => {
        clearInterval(pingInterval);
        clearTimeout(dropTimeout);
        
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }
        
        this.testInProgress = false;
        
        // Calculate average latency
        const averageLatency = this.latencies.length > 0
          ? this.latencies.reduce((sum, lat) => sum + lat, 0) / this.latencies.length
          : null;
        
        resolve({
          success: this.errors.length === 0 && this.messagesSent > 0 && this.messagesReceived > 0,
          connectionEstablished: this.messagesSent > 0,
          messagesSent: this.messagesSent,
          messagesReceived: this.messagesReceived,
          reconnectionAttempts: this.reconnectAttempts,
          reconnectionSuccessful: this.reconnectionSuccessful,
          errors: this.errors,
          averageLatency
        });
      }, testDurationMs);
    });
  }
  
  /**
   * Set up WebSocket with all necessary event handlers
   */
  private setupWebSocket(url: string): void {
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        if (this.reconnectAttempts > 0) {
          this.reconnectionSuccessful = true;
        }
        this.sendPing();
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.messagesReceived++;
          
          // Check if this is a response to a ping
          if (data.type === 'pong' && data.id && this.messageSendTimes.has(data.id)) {
            const sendTime = this.messageSendTimes.get(data.id);
            if (sendTime) {
              const latency = Date.now() - sendTime;
              this.latencies.push(latency);
              console.log(`Received pong with latency: ${latency}ms`);
            }
            this.messageSendTimes.delete(data.id);
          }
        } catch (error) {
          this.errors.push(`Error parsing message: ${error.message}`);
        }
      };
      
      this.socket.onerror = (error) => {
        this.errors.push(`WebSocket error: ${error}`);
        console.error('WebSocket error:', error);
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.attemptReconnect(url);
      };
    } catch (error) {
      this.errors.push(`Error creating WebSocket: ${error.message}`);
    }
  }
  
  /**
   * Send a ping message to test latency
   */
  private sendPing(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      const messageId = Date.now().toString();
      const message = {
        type: 'ping',
        id: messageId,
        timestamp: Date.now()
      };
      
      this.socket.send(JSON.stringify(message));
      this.messagesSent++;
      this.messageSendTimes.set(messageId, Date.now());
    } catch (error) {
      this.errors.push(`Error sending ping: ${error.message}`);
    }
  }
  
  /**
   * Force a connection drop to test reconnection
   */
  private forceConnectionDrop(): void {
    if (!this.socket) {
      return;
    }
    
    try {
      this.socket.close();
      this.socket = null;
    } catch (error) {
      this.errors.push(`Error forcing connection drop: ${error.message}`);
    }
  }
  
  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.errors.push(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached`);
      return;
    }
    
    const timeout = this.reconnectTimeouts[
      Math.min(this.reconnectAttempts, this.reconnectTimeouts.length - 1)
    ];
    
    console.log(`Attempting to reconnect in ${timeout}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.setupWebSocket(url);
    }, timeout);
  }
  
  /**
   * Reset internal state for a new test
   */
  private resetState(): void {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.messagesSent = 0;
    this.messagesReceived = 0;
    this.errors = [];
    this.latencies = [];
    this.messageSendTimes.clear();
    this.reconnectionSuccessful = false;
  }
}

/**
 * Run a complete WebSocket test with detailed reporting
 */
export async function testWebSocketReliability(wsUrl: string = 'ws://localhost:3000/ws-api'): Promise<{
  success: boolean;
  report: string;
  details: WebSocketTestResult;
}> {
  const tester = new WebSocketTester();
  
  try {
    console.log(`Testing WebSocket reliability for ${wsUrl}`);
    const result = await tester.testWebSocketConnection(wsUrl, 15000);
    
    // Generate report
    let report = '# WebSocket Reliability Test Report\n\n';
    report += `**Timestamp:** ${new Date().toLocaleString()}\n`;
    report += `**WebSocket URL:** ${wsUrl}\n\n`;
    report += `**Status:** ${result.success ? '✅ PASSED' : '❌ FAILED'}\n\n`;
    
    report += '## Test Results\n\n';
    report += `- **Connection Established:** ${result.connectionEstablished ? 'Yes' : 'No'}\n`;
    report += `- **Messages Sent:** ${result.messagesSent}\n`;
    report += `- **Messages Received:** ${result.messagesReceived}\n`;
    report += `- **Reconnection Attempts:** ${result.reconnectionAttempts}\n`;
    report += `- **Reconnection Successful:** ${result.reconnectionSuccessful ? 'Yes' : 'No'}\n`;
    report += `- **Average Latency:** ${result.averageLatency !== null ? `${result.averageLatency.toFixed(2)}ms` : 'N/A'}\n`;
    
    if (result.errors.length > 0) {
      report += '\n## Errors\n\n';
      result.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
    }
    
    report += '\n## Recommendations\n\n';
    
    if (!result.success) {
      if (!result.connectionEstablished) {
        report += '- Check if the WebSocket server is running correctly\n';
        report += '- Verify the WebSocket URL is correct\n';
      }
      
      if (result.messagesSent > 0 && result.messagesReceived === 0) {
        report += '- Check message handling on the server side\n';
        report += '- Verify message format is correct\n';
      }
      
      if (result.reconnectionAttempts > 0 && !result.reconnectionSuccessful) {
        report += '- Review reconnection logic\n';
        report += '- Ensure exponential backoff is implemented correctly\n';
      }
      
      if (result.errors.length > 0) {
        report += '- Address specific errors listed above\n';
      }
    } else {
      report += '- WebSocket implementation is working correctly\n';
      
      if (result.averageLatency !== null && result.averageLatency > 100) {
        report += '- Consider optimizing for lower latency (current average is high)\n';
      }
    }
    
    console.log(report);
    
    return {
      success: result.success,
      report,
      details: result
    };
  } catch (error) {
    const errorReport = `# WebSocket Test Error\n\nError: ${error.message}`;
    console.error(errorReport);
    
    return {
      success: false,
      report: errorReport,
      details: {
        success: false,
        connectionEstablished: false,
        messagesSent: 0,
        messagesReceived: 0,
        reconnectionAttempts: 0,
        reconnectionSuccessful: false,
        errors: [error.message],
        averageLatency: null
      }
    };
  }
}

// Export default function for easy use
export default testWebSocketReliability;
