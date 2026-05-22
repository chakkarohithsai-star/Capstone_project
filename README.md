# Capstone Blog App

A full-stack blog platform with separate frontend and backend applications. Users can register, log in, browse articles, and view individual posts. Authors can manage their own articles, including creating and editing posts.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Zustand, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Authentication: JWT and cookies
- Uploads: Multer and Cloudinary

## Project Structure

```text
.
+-- backend/
|   +-- APIs/              # Express route handlers
|   +-- config/            # Environment, Cloudinary, and upload config
|   +-- middlewares/       # Backend middleware
|   +-- models/            # Mongoose models
|   +-- services/          # Shared backend services
|   +-- server.js          # Backend entry point
+-- frontend/
    +-- public/
    +-- src/
        +-- api/           # Axios client
        +-- components/    # React pages and UI components
        +-- store/         # Zustand state
        +-- main.jsx       # Frontend entry point
```

## Prerequisites

- Node.js
- npm
- MongoDB database connection string
- Cloudinary account for article image uploads

## Environment Variables

Create `backend/.env`:

```env
PORT=4000
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

Create `frontend/.env` if you want to override the default API URL:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

The backend runs on `http://localhost:4000` by default.

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Vite will print the local frontend URL, usually `http://localhost:5173`.

## Available Scripts

Backend:

```bash
npm run dev      # Start backend with nodemon
npm start        # Start backend with node
```

Frontend:

```bash
npm run dev      # Start Vite development server
npm run build    # Build production frontend
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## API Route Groups

- `GET /` - Backend health check
- `/common-api` - Shared authentication and common routes
- `/user-api` - User routes
- `/author-api` - Author routes
- `/admin-api` - Admin routes

## Main Features

- User and author registration/login
- Role-protected frontend routes
- User article browsing
- Author article dashboard
- Create and edit articles
- Article detail pages
- Toast notifications
- Image upload support through Cloudinary
