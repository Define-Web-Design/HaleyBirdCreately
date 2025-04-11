# Creately Keep-Alive System

This document provides instructions for using and managing the Keep-Alive system that prevents your Replit dev URL from going to sleep.

## Why is this needed?

By default, Replit will put your dev URL to sleep after a period of inactivity. The Keep-Alive system ensures your application stays active 24/7, even when you're not actively using the workspace.

## Features

- **Reliable Pinging**: Regularly pings your application to keep it active
- **Dashboard**: Visual status monitoring at http://localhost:3333
- **Self-Recovery**: Attempts to recover from failures automatically
- **Compatibility**: Works with Replit's ESM/CommonJS environment
- **Low Resource Usage**: Minimal CPU and memory footprint

## How to Use

### Control Script

We've provided a simple control script to manage the Keep-Alive system:

```bash
# Check status
bash control-app.sh status

# Start the Keep-Alive system
bash control-app.sh start-keep-alive

# Stop the Keep-Alive system
bash control-app.sh stop-keep-alive

# Show help
bash control-app.sh help
```

### Dashboard

Once started, you can access the Keep-Alive dashboard at:
http://localhost:3334

The dashboard provides:
- System status
- Uptime information
- Ping statistics
- Success/failure rates

## Troubleshooting

### Keep-Alive Not Starting

If the Keep-Alive system fails to start, check the logs:

```bash
cat logs/never-sleep.log
```

Common issues:
1. **Permission Issues**: Make sure the control script is executable with `chmod +x control-app.sh`
2. **Port Conflicts**: If another service is using port 3334, the dashboard may fail to start
3. **Node.js Version**: The system requires Node.js to be installed

### Keep-Alive Stops Working

If the Keep-Alive system stops working:

1. Check current status: `bash control-app.sh status`
2. Stop any existing processes: `bash control-app.sh stop-keep-alive`
3. Restart the system: `bash control-app.sh start-keep-alive`
4. Check the logs: `cat logs/never-sleep.log`

## Advanced Information

### Technical Implementation

The Keep-Alive system consists of:

1. **replit-ping.cjs** - Core CommonJS-compatible script that pings your application
2. **control-app.sh** - Shell script for managing the keep-alive process
3. **Dashboard** - Web interface for monitoring status

### Custom Configuration

Advanced users can modify the configuration in `replit-ping.cjs`:

```js
// Configuration
const CONFIG = {
  APP_PORT: 3001,                       // Vite's default port in Replit
  CHECK_INTERVAL: 55 * 1000,            // Ping interval (milliseconds)
  DASHBOARD_PORT: 3334,                 // Dashboard port
  LOG_FILE: path.join(process.cwd(), 'logs', 'never-sleep.log'),
  LOG_LEVEL: 'info'                     // debug, info, warn, error
};
```

## Support

If you encounter issues with the Keep-Alive system:

1. Check the logs in `logs/never-sleep.log`
2. Try restarting the system using the control script
3. If persistent issues occur, you may need to modify the ping interval or other settings