# Xeno CRM Platform

A modern CRM platform for customer segmentation, campaign management, and intelligent marketing insights.

## Features

- Customer management and segmentation
- Campaign creation and management
- Email marketing
- Analytics and reporting
- Google OAuth authentication

## Development

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Redis (optional, for pub/sub)

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables by copying `.env.example` to `.env` and filling in the values
4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### Option 1: Manual Deployment

1. Build the application:
   ```
   npm run build:prod
   ```

2. Start the production server:
   ```
   npm start
   ```

### Option 2: Deployment Script

Run the deployment script:
```
npm run deploy
```

This will build the application and provide instructions for deploying to your server.

### Option 3: Heroku Deployment

1. Create a Heroku app:
   ```
   heroku create your-app-name
   ```

2. Set environment variables:
   ```
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=your-session-secret
   heroku config:set GOOGLE_CLIENT_ID=your-google-client-id
   heroku config:set GOOGLE_CLIENT_SECRET=your-google-client-secret
   heroku config:set OPENAI_API_KEY=your-openai-api-key
   ```

3. Push to Heroku:
   ```
   git push heroku main
   ```

### Option 4: GitHub Pages Deployment

For frontend-only deployment:

1. Update the `vite.config.ts` file to set the correct base path:
   ```js
   base: '/your-repo-name/',
   ```

2. Build the frontend:
   ```
   npm run build
   ```

3. Deploy the `dist/public` directory to GitHub Pages.

## Environment Variables

- `NODE_ENV`: Set to `development` or `production`
- `PORT`: The port to run the server on
- `SESSION_SECRET`: Secret for session encryption
- `APP_BASE_URL`: Base URL for the application (optional in production)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `DATABASE_URL`: PostgreSQL connection string

## License

MIT
