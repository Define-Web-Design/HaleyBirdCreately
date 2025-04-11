# Clean Application Version

This is a clean, optimized version of your application with only the essential dependencies and a streamlined folder structure.

## Structure

The application is organized as follows:

- `client/` - Frontend code
  - `src/` - React application source
    - `components/` - Reusable UI components
    - `pages/` - Page components
- `server/` - Backend code
  - `services/` - Business logic services
- `shared/` - Code shared between frontend and backend
  - `schema.ts` - Database schema and types

## Getting Started

To run the application:

1. Navigate to the clean_app directory
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Features

- Express backend with TypeScript
- React frontend with TypeScript
- PostgreSQL database with Drizzle ORM
- Authentication with JWT
- Route-based navigation with Wouter

## Development

- Use `npm run dev` to start the development server
- Use `npm run db:push` to sync database schema changes
- Use `npm run build` to create a production build