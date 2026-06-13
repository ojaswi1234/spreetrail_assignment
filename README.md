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

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
```bash
cd server
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```
The server will run on [http://localhost:5000](http://localhost:5000).

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The client will run on [http://localhost:5173](http://localhost:5173).

## CSV Import
1. Login to the app (e.g., `aisha@example.com` / `password123`).
2. Navigate to "Import CSV".
3. Upload `expenses_export.csv`.
4. Review the anomaly report and the "Ready to Import" list.
5. Click "Approve & Import" to finalize.

## Project Documents
- `SCOPE.md`: Anomaly log and database schema.
- `DECISIONS.md`: Decision log for architectural choices.
- `AI_USAGE.md`: Report on AI collaboration and error correction.
