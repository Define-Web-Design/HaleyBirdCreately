# HaleyBirdCreately Entry Points Guide

> **Purpose**: This document maps all server implementations and shell scripts in the project root, clarifying which is the primary entry point and when alternatives are used.

## Server Implementations

### Primary: `server/index.ts` (via `npm run dev`)
- **Role**: The canonical development and production server
- **Stack**: Express.js + TypeScript + Vite (HMR in dev, static serving in prod)
- **Database**: PostgreSQL via Drizzle ORM (`@neondatabase/serverless`)
- **AI**: OpenAI + Anthropic SDK integration
- **Run**: `npm run dev` (development) or `npm run build && npm start` (production)

### Legacy: `server.js` (284 lines)
- **Role**: Standalone Express server with API endpoints, static serving, AI integration
- **When used**: Fallback when TypeScript compilation fails or in simplified Replit deployment
- **Note**: Duplicates much of `server/index.ts` functionality in plain JavaScript

### Legacy: `simple-server.js` (342 lines)
- **Role**: Lightweight Express server for development/testing
- **When used**: Quick testing without full build pipeline
- **Note**: Subset of `server.js` features

### Legacy: `snippet-server.cjs` (1,518 lines)
- **Role**: All-in-one code snippet server using raw `http` module (no Express)
- **When used**: Standalone code snippet functionality without Express dependency
- **Note**: Largest single server file; contains its own routing, static serving, and API

### Legacy: `server.py` (197 lines)
- **Role**: Python HTTP server fallback
- **When used**: When Node.js is unavailable or for Python-native deployments
- **Note**: Minimal feature set compared to Node.js servers

### Redirect: `index.js` (64 lines)
- **Role**: Entry point that redirects to `server.js`
- **When used**: Default `node .` invocation
- **Note**: Just a loader/redirector, not a standalone server

## Shell Scripts

### Primary Workflow Scripts (Documented in README)
| Script | Purpose | Calls |
|--------|---------|-------|
| `dev.sh` | Development mode with live reload | `run-app.sh dev` |
| `prod.sh` | Production build and run | `run-app.sh build` |
| `deploy.sh` | Build and deploy for production | `run-app.sh deploy` |
| `db.sh` | Database schema updates | `run-app.sh db` |

### Workflow Engine
| Script | Purpose |
|--------|---------|
| `run-app.sh` | **Consolidated Workflow Manager v2.0.0** — orchestrates all workflows |
| `run-workflow.sh` | Thin wrapper that delegates to `run-app.sh` |
| `master-workflow.sh` | Earlier version of workflow orchestration |
| `diagnostics.sh` | Workflow system diagnostic tool |

### Server Launcher Scripts
| Script | Launches | Purpose |
|--------|----------|---------|
| `run-server.sh` | `snippet-server.cjs` | Runs snippet server on port 8080 |
| `run-simple-server.sh` | `simple-server.js` | Runs simple server |
| `run-snippet-server.sh` | `snippet-server.cjs` | Another snippet server launcher |
| `start-server.sh` | `simple-server.cjs` | Starts simple server on port 8080 |
| `start-snippet-server.sh` | snippet server | Starts snippet server with env vars |
| `snippet-server-workflow.sh` | snippet server | Workflow-based snippet server start |
| `code-snippet-server.sh` | snippet server | Improved snippet server workflow |
| `start-app.sh` | application | General application starter |
| `start-simple.sh` | application | Simplified application start |
| `start.sh` | application | Basic start script |
| `run.sh` | snippet server | Runs code snippet server |

### Deployment Scripts
| Script | Purpose |
|--------|---------|
| `deploy.sh` | Primary deployment (via run-app.sh) |
| `simplified-deploy.sh` | Fail-safe deployment with fallbacks |

### Other
| Script | Purpose |
|--------|---------|
| `run-discord-bot.sh` | Launches Discord.js bot (`discord_bot.js`) |
| `setup-ai-keys.js` | AI API key configuration utility |
| `code-snippet-workflow.js` | Code snippet processing workflow |

## Consolidation Recommendations

### High Priority: 11 Server Launcher Scripts → 1
The 11 `run-*.sh` / `start-*.sh` scripts all launch variations of the same servers. **Recommend**: Keep only `dev.sh`, `prod.sh`, `deploy.sh`, `db.sh` (the documented workflow scripts) and `run-app.sh` (the engine). Archive the rest.

### Medium Priority: 5 Server Implementations → 2
Keep `server/index.ts` (primary TypeScript) and `server.js` (JavaScript fallback). Archive `simple-server.js`, `snippet-server.cjs`, and `server.py` into a `legacy/` directory.

### Low Priority: Workflow Consolidation
`master-workflow.sh` appears to be an earlier version of `run-app.sh`. Archive it.

## Recommended Entry Point

```bash
# Development
npm run dev          # Uses server/index.ts via tsx

# Production
npm run build        # Builds frontend (Vite) + backend (esbuild)
npm start            # Runs dist/index.js

# Database
npm run db:push      # Pushes schema via drizzle-kit
```
