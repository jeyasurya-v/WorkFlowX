# WorkflowX

WorkflowX is a CI/CD monitoring platform that allows you to track and manage your development workflow pipelines across multiple providers.

## Project Structure

The project consists of two main components:

- `wx-frontend`: React-based frontend application
- `wx-backend`: Node.js Express-based backend API

## Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB (optional, falls back to mock data if not available)
- Redis (optional)
- PostgreSQL (optional)

## Getting Started

### Clone the repository

```bash
git clone https://github.com/yourusername/WorkflowX.git
cd WorkflowX
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd wx-backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration settings.

4. Start the development server:

```bash
npm run dev
```

The backend server will be available at http://localhost:8765.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd wx-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm start
```

The frontend application will be available at http://localhost:3000.

## Features

- User authentication and authorization
- CI/CD pipeline monitoring
- Real-time build status updates
- Support for multiple CI/CD providers
- Analytics and reporting dashboard

## Environment Variables

### Backend

See `.env.example` in the backend directory for required environment variables.

### Frontend

See `.env.example` in the frontend directory for required environment variables.

## Troubleshooting

### CORS Issues

If you encounter CORS-related issues:

1. Ensure the frontend is running on a URL that's allowed in the backend CORS configuration
2. Check the backend server logs for CORS-related messages
3. Verify the `.env` files have the correct URLs for frontend and backend

### API Connection Errors

If the frontend cannot connect to the backend:

1. Ensure the backend server is running
2. Check that the `REACT_APP_API_URL` in the frontend `.env` file matches the backend URL
3. Verify network connectivity between the frontend and backend

## License

[MIT](LICENSE)
