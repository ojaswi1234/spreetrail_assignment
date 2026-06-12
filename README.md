# Splitwise Clone MVP

This project is a simplified clone of Splitwise, built as part of an internship assignment.

## Features
- **User Authentication**: Secure register and login.
- **Group Management**: Create groups and manage members.
- **Expense Tracking**: Add expenses with multiple split modes (Equal, Exact, Percentage, Share).
- **Real-time Chat**: Discuss expenses within the app using WebSockets.
- **Balance Summaries**: Real-time calculation of who owes whom.
- **Debt Settlement**: Record payments to settle balances.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Vanilla CSS.
- **Backend**: Node.js, Express, TypeScript, Socket.io.
- **Database**: PostgreSQL (Prisma ORM) - *SQLite used for local development portability*.
- **AI Tool**: Gemini CLI (Interactive Agent).

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### Server Setup
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Initialize the database: `npx prisma migrate dev`
4. Start the server: `npm run dev` (Runs on port 5000)

### Client Setup
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev` (Runs on port 5173)

## AI Collaboration
This project was built in collaboration with Gemini CLI. The full context of the AI's decision-making process and instructions can be found in `AI_CONTEXT.md`.

## Build Plan
The roadmap and trade-offs are documented in `BUILD_PLAN.md`.
