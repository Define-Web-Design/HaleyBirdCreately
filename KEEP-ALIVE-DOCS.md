# Creately Keep-Alive System

This documentation explains the keep-alive system designed to prevent your Replit application from going to sleep due to inactivity. We've implemented two different approaches to ensure compatibility across different environments.

## Available Solutions

1. **Flask-based Keep-Alive (Recommended)**
   - More feature-rich with a web dashboard
   - Provides detailed statistics
   - Requires Python environment

2. **Bash-based Keep-Alive (Fallback)**
   - Ultra-minimal approach that only requires bash and curl
   - No external dependencies
   - Works in constrained environments where Python is not available

## Starting the Keep-Alive Service

The simplest way to start the keep-alive service is to run:

```bash
./start_keep_alive.sh
```

This script will automatically choose the best method based on your environment:
- If Python is available, it will use the Flask-based approach
- If Python is not available, it will fall back to the bash-only script

## Flask-based Keep-Alive

### Features
- Beautiful web dashboard to monitor status
- Detailed statistics about ping success/failure
- Configurable intervals and ports
- Automatic error handling
- Comprehensive logging

### Manual Start
To manually start the Flask version:

```bash
pip install flask requests
python keep_alive_flask.py
```

### Dashboard
After starting, you can access the dashboard at:
```
http://localhost:8080/
```

## Bash-based Keep-Alive

### Features
- Ultra-lightweight (only requires bash and curl)
- No external dependencies
- Minimal resource usage
- Detailed logging

### Manual Start
To manually start the bash version:

```bash
./keep-url-alive.sh
```

## How It Works

Both versions operate on the same principle:

1. Start a background process that periodically pings your application
2. Log successes and failures
3. Keep track of statistics
4. Provide visibility into the system's operation

The keep-alive service sends HTTP requests to your application at regular intervals (default: every 55 seconds), which prevents Replit from putting your application to sleep due to inactivity.

## Configuration

Both systems can be configured by editing the script files directly. The main configurable options are:

- `APP_PORT`: The port your application is running on (default: 5173 for Vite)
- `CHECK_INTERVAL`: Time between pings in seconds (default: 55 seconds)
- `DASHBOARD_PORT`: Port for the status dashboard (Flask version only, default: 8080)

## Troubleshooting

### The keep-alive service starts but my application still goes to sleep

Check that:
- Your application is actually running on the expected port
- There are no firewall rules blocking the internal requests
- The logs show successful pings (200 or 300-level HTTP responses)

### The Flask version won't start

Make sure:
- Python is installed
- You have installed the required packages (`flask` and `requests`)
- No other service is using port 8080

### The bash version won't start

Ensure:
- The script has execution permissions (`chmod +x keep-url-alive.sh`)
- `curl` is installed in your environment
- The log directory is writable