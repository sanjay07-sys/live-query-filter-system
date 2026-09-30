# Live Query Filter System

Full-stack implementation of the Live Query Filter task using the supplied 250-record learning-resource catalog.

## Features
- Backend search API with `search`, `category`, `level`, `page`, and `limit` query parameters
- 400ms debounced frontend search
- Category and level filters
- Server-side pagination
- Loading skeletons and empty/error states
- Responsive resource-card grid

## Run locally

### Backend
```bash
cd backend
npm install
npm run dev
```
API: `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173`

For deployment, set `VITE_API_URL` in the frontend to the deployed backend URL followed by `/api`.
