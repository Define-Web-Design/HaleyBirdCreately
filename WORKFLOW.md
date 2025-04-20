# Consolidated Workflow System

This document explains the new consolidated workflow system that simplifies the build, development, and deployment processes.

## Overview

The workflow system provides a standardized way to:
1. Run the application in development mode
2. Build and run the application in production mode
3. Deploy the application to production
4. Manage database schema updates

Instead of managing multiple configuration files and scripts, the application now uses a single, centralized workflow manager.

## How It Works

The workflow system consists of:

1. **workflow-config.json**: Configuration file that defines all available workflows
2. **run-app.sh**: Main script that acts as a workflow manager
3. **run-workflow.sh**: Helper script to easily run specific workflows

## Available Workflows

The system provides four main workflows:

1. **Development Mode**: Starts the application with live reloading for faster development
   ```
   ./run-workflow.sh "Development Mode"  # or ./run-workflow.sh 1
   ```

2. **Production Build**: Builds and runs the application in production mode
   ```
   ./run-workflow.sh "Production Build"  # or ./run-workflow.sh 2
   ```

3. **Deploy Application**: Builds and deploys the application for production use
   ```
   ./deploy.sh  # or ./run-workflow.sh "Deploy Application"
   ```
   
   > **Note**: The `deploy.sh` script has been enhanced with robust fallback mechanisms to handle build failures and ensure successful deployment even in challenging environments.

4. **Database Management**: Manages database schema updates and migrations
   ```
   ./run-workflow.sh "Database Management"  # or ./run-workflow.sh 4
   ```

## Running Workflows

You can run workflows in two ways:

### Method 1: Using run-app.sh Directly

Running `run-app.sh` without arguments will show an interactive menu:

```
./run-app.sh
```

This will display all available workflows and prompt you to select one.

### Method 2: Using run-workflow.sh Helper

For non-interactive usage, use the helper script:

```
./run-workflow.sh <workflow-name>
```

Where `<workflow-name>` is either the name of the workflow (in quotes) or its ID number (1-4).

## Configuration

The workflow system is configured through the `workflow-config.json` file. This file defines:

- Available workflows and their commands
- Default workflow to run when no specific workflow is specified
- Required dependencies for each workflow
- Environment variable defaults

## Troubleshooting

If you encounter issues with the workflow system:

1. Check the logs in the `logs/workflow-manager.log` file
2. Make sure all scripts are executable (`chmod +x run-app.sh run-workflow.sh`)
3. Verify that the `workflow-config.json` file exists and is valid JSON

## Extending the System

To add a new workflow:

1. Edit the `workflow-config.json` file
2. Add a new entry to the `workflows` array
3. Define the workflow's name, description, and command

## Fallback Mechanisms

The workflow system includes robust fallback mechanisms:

- If a workflow fails, it attempts to start a simple server (`simple-server.cjs`)
- If the build process fails, it tries alternative build methods
- If dependencies are missing, it attempts multiple installation methods
- If `jq` is not available, it falls back to basic parsing with grep/sed

These fallback mechanisms were specifically designed to handle the following scenarios:

1. **Build failures**: The system attempts alternative build paths when the standard build fails
2. **Dependency issues**: Multiple fallback methods for dependency installation
3. **Module format incompatibilities**: CommonJS fallback server handles ES module issues
4. **Server startup failures**: Graceful degradation to a minimal functionality server

This ensures the application remains as robust as possible, even in challenging environments.

### Fallback Server

If the main application fails to start, the system automatically launches a fallback server (`simple-server.cjs`) that provides:

- Basic static file serving
- Simple API status endpoint
- Informative error page with diagnostic information

This allows for minimal functionality and error reporting even when the main application cannot start properly.