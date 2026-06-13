# Shared Expenses App (Spreetail Assignment)

This is a full-stack shared expenses application built to replace messy spreadsheets. It features a robust CSV importer that handles data anomalies, supports dynamic group membership (members joining/leaving), and provides simplified debt settlement.

## Persona Requirements Addressed:
- **Aisha**: "one number per person" - Implemented via simplified debt calculation.
- **Rohan**: "No magic numbers" - Detailed breakdown view shows exactly which expenses make up a balance.
- **Priya**: Currency Support - USD expenses are converted to INR at import time.
- **Sam**: Date Isolation - Sam is only charged for expenses after his move-in date.
- **Meera**: Approval Flow - A two-step import process allows reviewing and approving all CSV changes/deletions.

## Tech Stack
- **Frontend**: React (TypeScript), Vite, Vanilla CSS.
- **Backend**: Node.js, Express (TypeScript), Prisma.
- **Database**: PostgreSQL (SQLite used for local development).

## Production Deployment

### 1. Backend (Render)
- **Runtime**: Node.js
- **Build Command**: `cd server && npm install && npx prisma generate && npm run build`
- **Start Command**: `cd server && npx prisma db push --accept-data-loss && npm start`
- **Environment Variables**:
  - `DATABASE_URL`: Your Render Postgres connection string.
  - `JWT_SECRET`: A long random string.
  - `PORT`: `5000` (or as provided by Render).

### 2. Frontend (Vercel)
- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://spreetrail-assignment-backend.onrender.com/api` (optional, as it's now the default).

### 3. Database
After connecting the Postgres database on Render, you may need to seed the initial data:
```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

## Project Documents
- `SCOPE.md`: Anomaly log and database schema.
- `DECISIONS.md`: Decision log for architectural choices.
- `AI_USAGE.md`: Report on AI collaboration and error correction.
