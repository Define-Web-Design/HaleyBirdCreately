# Creately Keep-Alive System

This document provides instructions for managing the Creately keep-alive system, which prevents your Replit development URL from going to sleep due to inactivity.

## Overview

The keep-alive system is a dedicated process that runs in the background and periodically pings your application to keep it active, ensuring it remains accessible 24/7 without sleeping.

## Features

- **Continuous Availability**: Keeps your Replit development URL active 24/7
- **Low Resource Usage**: Minimal impact on system resources
- **Dashboard Interface**: Monitor the status of the keep-alive system
- **Simple Control Commands**: Easy-to-use commands to start, stop, and check status

## Managing the Keep-Alive System

The keep-alive system can be managed using the included `control-app.sh` script.

### Starting the Keep-Alive System

To start the keep-alive system, run:

```bash
./control-app.sh start-keep-alive
```

This will launch the keep-alive process in the background and provide a URL for the dashboard interface.

### Checking the Status

To check if the keep-alive system is running:

```bash
./control-app.sh status
```

This will display whether the system is active, its process ID, and the dashboard URL.

### Stopping the Keep-Alive System

To stop the keep-alive system:

```bash
./control-app.sh stop-keep-alive
```

This will terminate the keep-alive process.

## Dashboard

The keep-alive system includes a web dashboard that provides real-time information about its status. The dashboard URL is displayed when you start the system or check its status.

The dashboard shows:

- System uptime
- Ping statistics
- Configuration details

## Automatic Startup

To ensure the keep-alive system starts automatically when your Replit workspace is opened, you can add the following line to your `.replit` file:

```
onBoot = "./control-app.sh start-keep-alive"
```

## Troubleshooting

If you encounter issues with the keep-alive system:

1. Check the logs in the `logs/never-sleep.log` file
2. Ensure there are no conflicting processes using the same ports
3. Try stopping and restarting the system

## Deployment Support

The control script also includes support for preparing your application for deployment:

```bash
./control-app.sh deploy
```

This will build your application for production and guide you through the deployment process using Replit's deployment features.

## Additional Help

To see all available commands:

```bash
./control-app.sh help
```
