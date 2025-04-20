# Creately Application

An advanced AI-powered collaborative platform that enhances team productivity through intelligent technologies and engaging user interactions.

## Overview

This application uses a consolidated workflow system for development, building, and deployment. The system is designed to be robust and handle various failure scenarios gracefully.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- (Optional) jq for enhanced JSON parsing

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database:
   ```
   npm run db:push
   ```

## Development Workflow

This project uses a consolidated workflow system to simplify development, building, and deployment processes.

### Available Workflows

1. **Development Mode** - For development with live reloading
   ```
   ./dev.sh
   ```

2. **Production Build** - Build and run in production mode
   ```
   ./prod.sh
   ```

3. **Deployment** - Build and deploy for production use
   ```
   ./deploy.sh
   ```

4. **Database Management** - Update database schema
   ```
   ./db.sh
   ```

For more details, see [WORKFLOW.md](WORKFLOW.md).

## Architecture

The application follows a modern full-stack JavaScript architecture:

- **Frontend**: React with TypeScript
- **Backend**: Express.js API server
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Configured for seamless Replit deployment

## Fallback Mechanisms

The system includes robust fallback mechanisms that ensure the application can continue to operate even in challenging environments:

- Automatic fallback to a simple server if the main application fails to start
- Multiple fallback paths for dependency installation
- Alternative build methods if the standard build process fails

This resilience ensures high availability and graceful degradation under various failure conditions.

## Contributing

Please read the [WORKFLOW.md](WORKFLOW.md) file for details on our workflow system and development process.

## License

This project is licensed under the MIT License.