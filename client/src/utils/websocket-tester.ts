
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
/**
 * WebSocket Testing Utility
 * 
 * A utility for testing WebSocket connections, including reliability, 
 * performance, and handling of edge cases.
 */

import { PerformanceProfiler } from './performance-profiler';

interface WebSocketTestOptions {
  url: string;
  protocols?: string | string[];
  timeout?: number;
  maxRetries?: number;
  initialBackoffDelay?: number;
  maxBackoffDelay?: number;
  backoffFactor?: number;
  testDuration?: number;
  messagesToSend?: number;
  messageInterval?: number;
  simulateDisconnects?: boolean;
  disconnectProbability?: number;
  mockResponses?: Record<string, any>;
}

interface WebSocketTestResult {
  success: boolean;
  connectionTime: number;
  roundTripTimes: number[];
  averageRoundTripTime: number;
  messagesSent: number;
  messagesReceived: number;
  disconnections: number;
  reconnections: number;
  errors: string[];
  testDuration: number;
  backoffDelays: number[];
}

export class WebSocketTester {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketTestOptions>;
  private isRunning = false;
  private disconnectTimer: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private pendingMessages: Map<string, { timestamp: number, payload: any }> = new Map();
  private backoffDelays: number[] = [];
  private results: Partial<WebSocketTestResult> = {
    roundTripTimes: [],
    errors: [],
    messagesSent: 0,
    messagesReceived: 0,
    disconnections: 0,
    reconnections: 0,
  };

  constructor(options: WebSocketTestOptions) {
    // Set defaults for options
    this.options = {
      url: options.url,
      protocols: options.protocols || [],
      timeout: options.timeout || 10000,
      maxRetries: options.maxRetries || 5,
      initialBackoffDelay: options.initialBackoffDelay || 1000,
      maxBackoffDelay: options.maxBackoffDelay || 30000,
      backoffFactor: options.backoffFactor || 1.5,
      testDuration: options.testDuration || 30000,
      messagesToSend: options.messagesToSend || 10,
      messageInterval: options.messageInterval || 1000,
      simulateDisconnects: options.simulateDisconnects || false,
      disconnectProbability: options.disconnectProbability || 0.1,
      mockResponses: options.mockResponses || {}
    };
  }

  /**
   * Run a comprehensive WebSocket test
   */
  public async runTest(): Promise<WebSocketTestResult> {
    if (this.isRunning) {
      throw new Error('Test is already running');
    }

    this.isRunning = true;
    this.resetTest();

    PerformanceProfiler.startMeasure(`WebSocketTest_${this.options.url}`);
    console.log(`Starting WebSocket test for ${this.options.url}`);

    try {
      // Start connection
      const startTime = performance.now();
      await this.connectWithRetry();
      const connectionTime = performance.now() - startTime;
      this.results.connectionTime = connectionTime;

      console.log(`Connected to WebSocket in ${connectionTime.toFixed(2)}ms`);

      // Run the main test
      const testResult = await this.runMainTest();
      
      // Clean up
      this.cleanUp();
      
      PerformanceProfiler.endMeasure(`WebSocketTest_${this.options.url}`);
      
      return {
        success: testResult.success,
        connectionTime: this.results.connectionTime!,
        roundTripTimes: this.results.roundTripTimes!,
        averageRoundTripTime: testResult.averageRoundTripTime,
        messagesSent: this.results.messagesSent!,
        messagesReceived: this.results.messagesReceived!,
        disconnections: this.results.disconnections!,
        reconnections: this.results.reconnections!,
        errors: this.results.errors!,
        testDuration: testResult.testDuration,
        backoffDelays: this.backoffDelays
      };
    } catch (error) {
      this.cleanUp();
      PerformanceProfiler.endMeasure(`WebSocketTest_${this.options.url}`);
      
      this.results.errors!.push(`Test failed: ${error.message}`);
      
      return {
        success: false,
        connectionTime: this.results.connectionTime || 0,
        roundTripTimes: this.results.roundTripTimes!,
        averageRoundTripTime: 0,
        messagesSent: this.results.messagesSent!,
        messagesReceived: this.results.messagesReceived!,
        disconnections: this.results.disconnections!,
        reconnections: this.results.reconnections!,
        errors: this.results.errors!,
        testDuration: 0,
        backoffDelays: this.backoffDelays
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Reset test state
   */
  private resetTest(): void {
    this.retryCount = 0;
    this.pendingMessages.clear();
    this.backoffDelays = [];
    this.results = {
      roundTripTimes: [],
      errors: [],
      messagesSent: 0,
      messagesReceived: 0,
      disconnections: 0,
      reconnections: 0,
    };
  }

  /**
   * Attempt to connect with exponential backoff retry
   */
  private connectWithRetry(): Promise<void> {
    return new Promise((resolve, reject) => {
      const attemptConnect = () => {
        try {
          // Calculate backoff delay based on retry count
          let backoffDelay = 0;
          if (this.retryCount > 0) {
            backoffDelay = Math.min(
              this.options.initialBackoffDelay * Math.pow(this.options.backoffFactor, this.retryCount - 1),
              this.options.maxBackoffDelay
            );
            this.backoffDelays.push(backoffDelay);
            console.log(`Retry #${this.retryCount} with backoff delay: ${backoffDelay}ms`);
          }

          setTimeout(() => {
            this.connect()
              .then(() => {
                if (this.retryCount > 0) {
                  this.results.reconnections!++;
                }
                resolve();
              })
              .catch(error => {
                this.results.errors!.push(`Connection attempt #${this.retryCount + 1} failed: ${error.message}`);
                this.retryCount++;
                
                if (this.retryCount <= this.options.maxRetries) {
                  // Retry
                  attemptConnect();
                } else {
                  reject(new Error(`Failed to connect after ${this.options.maxRetries} attempts`));
                }
              });
          }, backoffDelay);
        } catch (error) {
          reject(error);
        }
      };

      attemptConnect();
    });
  }

  /**
   * Connect to the WebSocket
   */
  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.options.url, this.options.protocols);

        // Set up timeout
        const timeoutId = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            reject(new Error('Connection timed out'));
          }
        }, this.options.timeout);

        // Set up event handlers
        this.ws.onopen = () => {
          clearTimeout(timeoutId);
          this.setupMessageHandlers();
          resolve();
        };

        this.ws.onerror = (event) => {
          clearTimeout(timeoutId);
          reject(new Error('WebSocket connection error'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Set up WebSocket message handlers
   */
  private setupMessageHandlers(): void {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        
        // Check if this is a response to a message we sent
        if (response.id && this.pendingMessages.has(response.id)) {
          const { timestamp } = this.pendingMessages.get(response.id)!;
          const roundTripTime = performance.now() - timestamp;
          
          this.results.roundTripTimes!.push(roundTripTime);
          this.pendingMessages.delete(response.id);
          this.results.messagesReceived!++;
          
          console.log(`Received response for message ${response.id}, RTT: ${roundTripTime.toFixed(2)}ms`);
        } else {
          // Unsolicited message
          this.results.messagesReceived!++;
          console.log(`Received unsolicited message:`, response);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        this.results.errors!.push(`Error processing message: ${error.message}`);
      }
    };

    this.ws.onclose = (event) => {
      console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
      this.results.disconnections!++;
      
      if (this.isRunning && !event.wasClean) {
        // Attempt to reconnect for unexpected disconnections
        this.retryCount = 0;
        this.connectWithRetry()
          .catch(error => {
            console.error('Failed to reconnect:', error);
            this.results.errors!.push(`Reconnection failed: ${error.message}`);
          });
      }
    };

    this.ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.results.errors!.push('WebSocket error occurred');
    };
  }

  /**
   * Run the main WebSocket test
   */
  private runMainTest(): Promise<{ 
    success: boolean; 
    averageRoundTripTime: number;
    testDuration: number;
  }> {
    return new Promise((resolve) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        resolve({
          success: false,
          averageRoundTripTime: 0,
          testDuration: 0
        });
        return;
      }

      const startTime = performance.now();
      let messagesProcessed = 0;
      let simulatedDisconnectWasTriggered = false;

      // Set up a timer to end the test
      const testEndTimer = setTimeout(() => {
        finishTest();
      }, this.options.testDuration);

      // Function to finish the test
      const finishTest = () => {
        clearTimeout(testEndTimer);
        if (this.disconnectTimer) {
          clearTimeout(this.disconnectTimer);
          this.disconnectTimer = null;
        }

        const testDuration = performance.now() - startTime;
        
        // Calculate average round-trip time
        const totalRtt = this.results.roundTripTimes!.reduce((sum, time) => sum + time, 0);
        const averageRoundTripTime = this.results.roundTripTimes!.length > 0 
          ? totalRtt / this.results.roundTripTimes!.length 
          : 0;
        
        // Determine success
        const success = 
          this.results.errors!.length === 0 && 
          this.results.messagesReceived! >= (this.options.messagesToSend * 0.8); // At least 80% of messages received
        
        resolve({
          success,
          averageRoundTripTime,
          testDuration
        });
      };

      // Set up simulated disconnects if enabled
      if (this.options.simulateDisconnects) {
        this.setupSimulatedDisconnects();
      }

      // Send test messages
      const sendInterval = setInterval(() => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          clearInterval(sendInterval);
          return;
        }

        messagesProcessed++;
        
        // Send a message
        this.sendTestMessage();
        
        // If we've sent all messages, clear the interval
        if (messagesProcessed >= this.options.messagesToSend) {
          clearInterval(sendInterval);
          
          // Give some time for responses to come back before ending
          setTimeout(() => {
            if (this.pendingMessages.size === 0) {
              finishTest();
            } else {
              // Wait a bit longer for pending messages
              setTimeout(finishTest, 2000);
            }
          }, this.options.messageInterval);
        }
        
        // Optionally trigger a simulated disconnect
        if (this.options.simulateDisconnects && 
            !simulatedDisconnectWasTriggered && 
            Math.random() < this.options.disconnectProbability) {
          this.simulateDisconnect();
          simulatedDisconnectWasTriggered = true;
        }
      }, this.options.messageInterval);
    });
  }

  /**
   * Send a test message
   */
  private sendTestMessage(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const messageId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const message = {
      id: messageId,
      type: 'test',
      timestamp: Date.now(),
      payload: {
        test: true,
        value: Math.random()
      }
    };

    try {
      // Store the message for tracking
      this.pendingMessages.set(messageId, {
        timestamp: performance.now(),
        payload: message
      });
      
      // Send the message
      this.ws.send(JSON.stringify(message));
      this.results.messagesSent!++;
      
      console.log(`Sent test message ${messageId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      this.results.errors!.push(`Failed to send message: ${error.message}`);
      this.pendingMessages.delete(messageId);
    }
  }

  /**
   * Set up simulated disconnects
   */
  private setupSimulatedDisconnects(): void {
    // For the sake of this test utility, we'll use a timer-based approach
    // for simulating disconnects, rather than actually closing the socket
    
    this.disconnectTimer = setTimeout(() => {
      this.simulateDisconnect();
    }, this.options.testDuration / 2); // Disconnect halfway through the test
  }

  /**
   * Simulate a WebSocket disconnect
   */
  private simulateDisconnect(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    console.log('Simulating WebSocket disconnect...');
    this.ws.close();
  }

  /**
   * Clean up resources
   */
  private cleanUp(): void {
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }

    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }
  }

  /**
   * Generate a test report
   */
  public static generateTestReport(results: WebSocketTestResult): string {
    let report = `# WebSocket Test Report\n\n`;
    
    report += `## Overview\n`;
    report += `- Success: ${results.success ? '✅ Yes' : '❌ No'}\n`;
    report += `- Connection Time: ${results.connectionTime.toFixed(2)}ms\n`;
    report += `- Avg Round-Trip Time: ${results.averageRoundTripTime.toFixed(2)}ms\n`;
    report += `- Messages Sent: ${results.messagesSent}\n`;
    report += `- Messages Received: ${results.messagesReceived}\n`;
    report += `- Received Ratio: ${((results.messagesReceived / results.messagesSent) * 100).toFixed(1)}%\n`;
    report += `- Disconnections: ${results.disconnections}\n`;
    report += `- Reconnections: ${results.reconnections}\n`;
    report += `- Test Duration: ${(results.testDuration / 1000).toFixed(2)}s\n\n`;
    
    report += `## Round-Trip Times\n`;
    if (results.roundTripTimes.length > 0) {
      const min = Math.min(...results.roundTripTimes);
      const max = Math.max(...results.roundTripTimes);
      
      report += `- Min: ${min.toFixed(2)}ms\n`;
      report += `- Max: ${max.toFixed(2)}ms\n`;
      report += `- Avg: ${results.averageRoundTripTime.toFixed(2)}ms\n`;
    } else {
      report += `- No round-trip times recorded\n`;
    }
    
    report += `\n## Backoff Delays\n`;
    if (results.backoffDelays.length > 0) {
      results.backoffDelays.forEach((delay, index) => {
        report += `- Retry #${index + 1}: ${delay}ms\n`;
      });
    } else {
      report += `- No backoff delays recorded\n`;
    }
    
    report += `\n## Errors\n`;
    if (results.errors.length > 0) {
      results.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
    } else {
      report += `- No errors recorded\n`;
    }
    
    return report;
  }
}

/**
 * Run a standard WebSocket test
 */
export async function testWebSocketConnection(url: string): Promise<WebSocketTestResult> {
  const tester = new WebSocketTester({
    url,
    testDuration: 15000,
    messagesToSend: 10,
    messageInterval: 1000,
    simulateDisconnects: false
  });
  
  return tester.runTest();
}

/**
 * Test WebSocket reconnection logic
 */
export async function testWebSocketReconnection(url: string): Promise<WebSocketTestResult> {
  const tester = new WebSocketTester({
    url,
    testDuration: 30000,
    messagesToSend: 15,
    messageInterval: 1000,
    simulateDisconnects: true,
    disconnectProbability: 1.0, // Force a disconnect
    maxRetries: 5,
    initialBackoffDelay: 1000,
    backoffFactor: 1.5
  });
  
  return tester.runTest();
}

/**
 * Run a comprehensive WebSocket system test
 */
export async function runWebSocketSystemTest(url: string): Promise<{
  basicTest: WebSocketTestResult;
  reconnectionTest: WebSocketTestResult;
  report: string;
}> {
  console.log(`Running comprehensive WebSocket system test for ${url}`);
  
  PerformanceProfiler.startMeasure('WebSocketSystemTest');
  
  // First run a basic connection test
  console.log('Running basic WebSocket test...');
  const basicTest = await testWebSocketConnection(url);
  
  // Then test reconnection capabilities
  console.log('Running WebSocket reconnection test...');
  const reconnectionTest = await testWebSocketReconnection(url);
  
  // Generate comprehensive report
  let report = `# WebSocket System Test Results\n\n`;
  
  report += `## Basic Connection Test\n`;
  report += WebSocketTester.generateTestReport(basicTest).split('\n').slice(1).join('\n');
  
  report += `\n## Reconnection Test\n`;
  report += WebSocketTester.generateTestReport(reconnectionTest).split('\n').slice(1).join('\n');
  
  report += `\n## Overall Assessment\n`;
  const overallSuccess = basicTest.success && reconnectionTest.success;
  report += `- Overall Status: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}\n`;
  
  if (!overallSuccess) {
    report += '\n### Issues to Address:\n';
    
    if (!basicTest.success) {
      report += '- Basic WebSocket connectivity issues\n';
      basicTest.errors.forEach(error => {
        report += `  - ${error}\n`;
      });
    }
    
    if (!reconnectionTest.success) {
      report += '- WebSocket reconnection issues\n';
      reconnectionTest.errors.forEach(error => {
        report += `  - ${error}\n`;
      });
    }
    
    report += '\n### Recommendations:\n';
    
    if (basicTest.averageRoundTripTime > 500) {
      report += '- Investigate high round-trip times\n';
    }
    
    if (reconnectionTest.reconnections < reconnectionTest.disconnections) {
      report += '- Improve reconnection logic\n';
    }
    
    if (basicTest.messagesReceived < basicTest.messagesSent) {
      report += '- Fix message handling to ensure all messages are processed\n';
    }
  }
  
  PerformanceProfiler.endMeasure('WebSocketSystemTest');
  
  return {
    basicTest,
    reconnectionTest,
    report
  };
}
