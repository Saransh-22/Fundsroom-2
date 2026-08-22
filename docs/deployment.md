# Deployment Architecture

This document describes the deployment strategy and configuration for the Fundsroom-2 ERP application.

## Overview

The application follows a decoupled full-stack architecture, allowing the frontend and backend to be deployed independently. The architecture consists of three main components:

1. **Frontend**: React SPA deployed on a static hosting provider (Vercel).
2. **Backend**: Node.js Express API deployed on a container or PaaS provider (e.g., Railway, Render).
3. **Database**: A managed PostgreSQL database instance.

## Frontend Deployment (Vercel)

The frontend is built using Vite.
- **Build Command**: `npm run build` (runs `tsc -b && vite build`).
- **Output Directory**: `dist`
- **Environment Variables**: Requires `VITE_API_URL` to be set to the production URL of the backend API (e.g., `https://api.fundsroom-erp.com/api`).
- **Routing**: Because it is a Single Page Application using React Router, the host must be configured to redirect all traffic to `index.html`.

## Backend Deployment (Railway / Render)

The backend is a TypeScript Node.js application.
- **Build Command**: `npm run build` (runs `tsc` to compile TypeScript to JavaScript in the `dist` folder).
- **Start Command**: `npm start` (runs `node dist/server.js`).
- **Environment Variables**:
  - `PORT`: Exposed port for the web server (defaults to 3000 if not provided, but usually dynamically assigned by the PaaS).
  - `DATABASE_URL`: Full connection string to the production PostgreSQL database.
  - `JWT_SECRET`: A strong secret key for signing authentication tokens.
- **CORS Configuration**: The backend explicitly allows origins from `.vercel.app`, indicating that it is designed to accept cross-origin requests from the Vercel-hosted frontend.

## Database Deployment

The database is a standard PostgreSQL instance.
- **Connection**: The backend connects using the `pg` driver pooling mechanism.
- **Initialization**: Upon first deployment, the database schema must be initialized. The project includes a setup script (`npm run setup`) which creates tables and seeds initial data.

## Environment Independence

As required by the case study, the application logic does not depend heavily on one hosting provider. 
- Configuration is entirely environment-variable based.
- The backend API can be containerized using Docker (if added) or run on any standard Node.js runtime.
- The frontend produces standard static assets deployable to S3, Netlify, Vercel, or NGINX.
