
/**
 * Client Debugging Utility
 * 
 * This script injects debugging code into the client build
 * to help identify frontend issues.
 */

const fs = require('fs');
const path = require('path');

// Path to the main client index file
const indexPath = path.join(__dirname, '../client/src/index.tsx');
const debugIndexPath = path.join(__dirname, '../client/src/index.debug.tsx');

console.log('Setting up client debugging...');

// Check if the file exists
if (!fs.existsSync(indexPath)) {
  console.error(`Error: ${indexPath} not found`);
  process.exit(1);
}

// Read the original file
const content = fs.readFileSync(indexPath, 'utf8');

// Create debug version with extra logging
const debugContent = `// Debug version - automatically generated
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Setup global error handler
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error caught:', { message, source, lineno, colno, error });
  
  // Log to server if in production
  if (process.env.NODE_ENV === 'production') {
    try {
      fetch('/api/logs/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: message,
          source,
          lineno,
          colno,
          stack: error?.stack,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(e => console.error('Failed to report error:', e));
    } catch (e) {
      console.error('Failed to send error to server:', e);
    }
  }
  
  return false; // Let the default handler run
};

// Setup promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
});

// Enable React strict mode for additional checks
const StrictApp = () => (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Add performance monitoring
const reportWebVitals = ({ name, delta, id, entries }) => {
  console.log('Web Vitals:', { name, delta, id });
  
  // Send to server
  try {
    fetch('/api/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value: delta, id })
    }).catch(e => console.error('Failed to report web vital:', e));
  } catch (e) {
    console.error('Failed to send web vital to server:', e);
  }
};

// Debug component rendering
class DebugObserver extends React.Component {
  componentDidMount() {
    console.log('App mounted');
  }
  
  componentDidUpdate() {
    console.log('App updated');
  }
  
  render() {
    return this.props.children;
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <DebugObserver>
    <StrictApp />
  </DebugObserver>
);

// Import web-vitals
import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
  getCLS(reportWebVitals);
  getFID(reportWebVitals);
  getFCP(reportWebVitals);
  getLCP(reportWebVitals);
  getTTFB(reportWebVitals);
});

console.log('Debug mode enabled - React v' + React.version);
`;

// Write the debug version
fs.writeFileSync(debugIndexPath, debugContent);

console.log(`Debug client version created at ${debugIndexPath}`);
console.log('To use the debug version:');
console.log('1. Rename index.tsx to index.original.tsx');
console.log('2. Rename index.debug.tsx to index.tsx');
console.log('3. Restart your development server');
console.log('4. Check the console for detailed logging');
