# Creately Keep-Alive Quick Start

This guide provides quick instructions for starting the keep-alive system when Replit's workflows are unavailable.

## 1. Starting the Keep-Alive System Manually

When Replit's workflows are unavailable or npm is not working, use these commands to start the keep-alive system manually:

```bash
# Make scripts executable (if not already)
chmod +x launch.sh forever-alive.sh

# Start the keep-alive system in the background
nohup ./forever-alive.sh > /dev/null 2>&1 &

# Verify it's running
ps aux | grep forever-alive
cat logs/forever-alive.log
```

## 2. Troubleshooting

If the keep-alive system isn't working, try these steps:

1. Check if it's running:
   ```bash
   ps aux | grep forever-alive
   ```

2. Check the log files:
   ```bash
   cat logs/forever-alive.log
   ```

3. If it's not running, restart it:
   ```bash
   nohup ./forever-alive.sh > /dev/null 2>&1 &
   ```

4. If you want to stop it:
   ```bash
   pkill -f forever-alive.sh
   ```

## 3. Features

The `forever-alive.sh` script combines multiple functions:

1. **Keep-Alive System**: Continuously pings the application to keep it alive
2. **Static Server Fallback**: Provides a minimal HTTP server when npm isn't available
3. **Self-Healing**: Automatically recovers from errors and failures
4. **Multiple Fallbacks**: Uses different methods depending on available tools (curl, wget, netcat, etc.)

## 4. When to Use

You should manually start the keep-alive system when:

- Replit's workflows are not working
- npm is not available in the environment
- You need to ensure the application stays responsive
- You want to provide a fallback static page when the main app is down

For more detailed information, see the complete [KEEP-ALIVE-README.md](KEEP-ALIVE-README.md).