# PipelineRadar Backend

Backend services for the PipelineRadar CI/CD monitoring platform.

## Architecture

The backend is built with:
- Node.js + Express
- MongoDB for document storage
- PostgreSQL for relational data
- Redis for caching and pub/sub
- Socket.io for real-time updates
- BullMQ for job processing
- JWT + OAuth for authentication

## Project Structure

```
wx-backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── integrations/   # CI/CD provider integrations
│   ├── websockets/     # WebSocket handlers
│   ├── queue/          # Queue processors
│   └── server.js       # Entry point
├── tests/              # Test files
└── .env.example        # Environment variables template
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:
```bash
npm run dev
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Database Setup

### MongoDB
- Used for storing pipeline data, build logs, and notifications

### PostgreSQL
- Used for user management, organizations, and analytics data

### Redis
- Used for caching, session management, and pub/sub for real-time updates

## CI/CD Provider Integrations

The backend includes webhook handlers and API clients for:
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI

Each integration is implemented as a plugin in the `src/integrations` directory.
