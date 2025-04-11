# Creately - Advanced Intelligent Collaborative Platform

Creately is a cutting-edge collaborative platform leveraging AI to enhance team productivity through intelligent, adaptive technologies and engaging user experiences.

## Quick Start

To run the application, use the following command:

```bash
./run-creately.sh
```

This script will automatically determine the best way to start the application in your environment.

## Manual Start Options

If you prefer to start the application manually, you have several options:

### Option 1: Using the enhanced starter script

```bash
./start-app.sh
```

This script performs thorough environment checks and provides detailed feedback.

### Option 2: Using the core starter

```bash
./start.sh
```

This is a simpler starter script with basic checks.

### Option 3: Using Node.js directly

```bash
node start-app.js
```

This runs the JavaScript starter directly.

## Core Technologies

- React.js with TypeScript frontend
- Tailwind CSS for responsive design
- Advanced machine learning recommendation system
- Real-time collaborative workspace
- Adaptive UI with personalized interactions
- PostgreSQL database for persistent storage

## Environment Variables

The application uses several environment variables that can be configured in the `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | The port on which the server runs | 3000 |
| `NODE_ENV` | Environment mode (development/production) | development |
| `DATABASE_URL` | PostgreSQL database connection URL | Uses in-memory if not set |
| `BYPASS_AUTH` | Enables authentication bypass (development only) | false |
| `OPENAI_API_KEY` | OpenAI API key for AI features | (Required for AI features) |
| `MISTRAL_API_KEY` | Mistral AI API key for alternative AI model | (Optional) |
| `CODESTRAL_API_KEY` | Codestral API key for code generation | (Optional) |
| `SESSION_SECRET` | Secret for session cookie encryption | creately-development-session-secret |

## Troubleshooting

If you encounter issues starting the application:

1. Check if the starter scripts are executable:
   ```bash
   chmod +x start.sh start-app.sh run-creately.sh
   ```

2. Verify your environment variables:
   ```bash
   cat .env
   ```

3. Check database connectivity:
   ```bash
   echo $DATABASE_URL
   ```

4. If the main server fails, the application will automatically try to use the fallback server.

## License

© 2025 Creately. All rights reserved.

---

For more information, contact [info@creately.app](mailto:info@creately.app)