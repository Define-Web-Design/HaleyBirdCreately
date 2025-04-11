# Creately Keep-Alive System

This is a robust, multi-layered keep-alive system designed for the Creately application running on Replit. It ensures your application remains responsive even when you're not actively accessing the Replit workspace.

## Features

- **Multi-Layered Approach**: Multiple fallback mechanisms ensure reliability in all environments
- **Self-Healing**: Automatic recovery from failures with smart retry logic
- **Resource-Aware**: Adaptive to available system resources (Node.js, bash, etc.)
- **Process Guarantees**: Watchdog processes ensure continuous operation
- **Extensive Logging**: Detailed logs to help diagnose any issues
- **Workflow Integration**: Seamless integration with Replit's workflow system

## How It Works

The system employs a hierarchical approach to keep your application alive:

1. **Top-Level Control**: `startup.sh` initializes everything and chooses the best available methods
2. **Keep-Alive Core**: `keep-url-alive.sh` (bash) or `keep-alive.js` (Node.js) continuously pings your application
3. **Application Fallback**: If npm/Node.js is not available, `run-static.sh` provides a minimal but functional server
4. **Process Management**: `control-keep-alive.sh` gives you easy start/stop/status commands

## Quick Start

```bash
# Start the keep-alive system with all automatic fallbacks
./startup.sh

# Check status of the keep-alive processes
./control-keep-alive.sh status

# Stop all keep-alive processes
./control-keep-alive.sh stop

# Restart the keep-alive system
./control-keep-alive.sh restart
```

## Component Details

### startup.sh

The main entry point that:
- Checks available system resources
- Chooses the best keep-alive method (Node.js or bash)
- Initializes application fallbacks if npm is not available
- Ensures everything starts correctly

### keep-url-alive.sh

Bash-based keep-alive system with:
- Minimal dependencies (works with just curl, wget, or netcat)
- Multiple URL detection fallbacks
- Self-healing watchdog process
- Adaptive check intervals based on failure patterns

### run-static.sh

Application fallback that:
- Provides a functional static server when npm/Node.js isn't available
- Tries multiple server methods (Python, busybox, netcat)
- Creates a minimal but functional UI for users
- Has guaranteed process persistence

### control-keep-alive.sh

Management interface that:
- Detects all running keep-alive processes regardless of method
- Provides simple start/stop/restart commands
- Shows detailed status including process uptime
- Displays recent log entries for quick diagnostics

## Troubleshooting

### Common Issues

**Keep-alive not running**
```bash
# Check status
./control-keep-alive.sh status

# Check logs
cat logs/startup.log
cat logs/bash-keep-alive.log

# Restart system
./startup.sh
```

**Application shows as unavailable**
```bash
# Check if application fallback is running
ps aux | grep run-static

# Check logs
cat logs/static-server.log

# Manually start the fallback
./run-static.sh
```

## Advanced Configuration

The keep-alive system can be customized by editing the configuration variables at the top of each script:

- `APP_PORT`: The port your application runs on (default: 5173)
- `CHECK_INTERVAL`: Seconds between keep-alive checks (default: 55)
- `LOG_FILE`: Where logs are stored

## System Requirements

The system is designed to work with minimal requirements:
- Bash shell
- curl, wget, or netcat (at least one of these)
- Basic file system access

For optimal operation:
- Node.js (for the enhanced keep-alive system)
- npm (for the main application)
- Python or busybox (for better fallback servers)

## Development Notes

This system was developed to address persistent issues with Replit's environment where sometimes Node.js and npm are not available. The multi-layered approach ensures that regardless of the available resources, something will keep your application accessible.

## License

This keep-alive system is part of the Creately application and is subject to the same licensing terms.

---

Last updated: April 11, 2025