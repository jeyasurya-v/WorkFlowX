# PipelineRadar Frontend

Frontend application for the PipelineRadar CI/CD monitoring platform.

## Technology Stack

The frontend is built with:
- React 18 with functional components and hooks
- Redux Toolkit for state management
- React Router for navigation
- TailwindCSS for styling
- Socket.io for real-time updates
- Chart.js for data visualization
- Formik and Yup for form handling and validation
- Axios for API requests

## Project Structure

```
wx-frontend/
├── public/             # Static files
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Generic UI components
│   │   ├── dashboard/  # Dashboard-specific components
│   │   ├── pipelines/  # Pipeline-specific components
│   │   ├── auth/       # Authentication components
│   │   └── layout/     # Layout components
│   ├── features/       # Redux slices and feature logic
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API and socket services
│   ├── utils/          # Utility functions
│   ├── App.js          # Main app component
│   ├── index.js        # Entry point
│   └── store.js        # Redux store configuration
└── tailwind.config.js  # TailwindCSS configuration
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
npm start
```

## Features

- **Authentication**: Login, registration, and OAuth integration
- **Dashboard**: Overview of all pipelines and recent builds
- **Pipeline Management**: Create, edit, and monitor pipelines
- **Build History**: View detailed build information and logs
- **Real-time Updates**: Live updates via WebSockets
- **Analytics**: Visualize build statistics and trends
- **Notifications**: Real-time alerts for pipeline events
- **User Management**: Manage organization members and permissions
- **Dark/Light Theme**: Toggle between dark and light modes

## Connecting to Backend

The frontend connects to the PipelineRadar backend API. Configure the API endpoint in the `.env` file:

```
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_SOCKET_URL=http://localhost:5000
```
