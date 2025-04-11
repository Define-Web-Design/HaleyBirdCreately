# Never-Sleep System for Replit

This guide explains how to use the Never-Sleep system to prevent your Replit dev URL from going to sleep when you leave the workspace.

## What It Does

The Never-Sleep system is a sophisticated monitoring solution that keeps your application running 24/7 by:

1. Continuously monitoring your application health
2. Automatically restarting it if any issues are detected
3. Implementing smart retry logic with exponential backoff
4. Providing a dashboard to view statistics and manually control the system
5. Preventing Replit's automatic sleep functionality

## How to Use

### Quick Start

The easiest way to start the system is by running:

```bash
./keep-url-alive.sh start
```

This command starts the Never-Sleep system in the background. Once started, your application will stay running even when you close the Replit tab.

### Available Commands

- **Start**: `./keep-url-alive.sh start`
  - Starts the Never-Sleep system in the background

- **Stop**: `./keep-url-alive.sh stop`
  - Stops the Never-Sleep system

- **Status**: `./keep-url-alive.sh status`
  - Checks if the Never-Sleep system is running

- **Restart**: `./keep-url-alive.sh restart`
  - Restarts the Never-Sleep system

- **Logs**: `./keep-url-alive.sh logs`
  - Shows the most recent logs from the Never-Sleep system

- **Dashboard**: `./keep-url-alive.sh dashboard`
  - Opens the monitoring dashboard in your browser

### Monitoring Dashboard

The system provides a dashboard at `http://localhost:3333/` where you can:

- View system status and statistics
- Manually restart your application
- See uptime and performance metrics

## Auto-Start on Replit Boot

The system is configured to auto-start whenever your Replit environment boots up. This configuration is in the `.replit.nix` file.

If you want to disable auto-start, you can edit the `.replit.nix` file and remove the `onBoot` section.

## Advanced Configuration

To customize the Never-Sleep system, you can edit the `never-sleep.js` file:

- Change monitoring intervals
- Configure which routes to check for health status
- Adjust timeout and retry settings
- Modify other performance parameters

## Files

- `never-sleep.js` - The main monitoring system
- `keep-url-alive.sh` - Easy control script
- `startup.sh` - Used for auto-starting on Replit boot
- `control-app.sh` - Alternative control script with more options
- `logs/never-sleep.log` - Log file for the Never-Sleep system

## Troubleshooting

If you encounter any issues:

1. Check the logs with `./keep-url-alive.sh logs`
2. Restart the system with `./keep-url-alive.sh restart`
3. Make sure port 3333 is available for the monitoring dashboard

## Notes

- The Never-Sleep system uses minimal resources to prevent impacting your application's performance
- It's designed specifically for the Replit environment
- All logs are stored in the `logs/` directory