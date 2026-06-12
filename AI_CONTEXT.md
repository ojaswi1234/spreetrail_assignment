# AI Context: Splitwise Clone MVP

This file is the absolute source of truth for the Splitwise Clone project. It contains the full context used to generate the app, as required by the assignment.

## 1. Product Understanding
A simplified clone of Splitwise for managing shared expenses within groups. Users can track who owes whom, split expenses in various ways, and settle debts.

## 2. Product Scope (MVP)
- **User Authentication**: Simple Register/Login.
- **Group Management**: Create groups, invite/add users (via email/username), and remove users.
- **Expense Management**:
    - **Splitting**: Equal, Exact amounts (Unequal), Percentage, and Share-based splits.
    - **Real-time Chat**: In-expense chat for discussions.
    - **Balance Summary**: Group-wise and individual balance views.
    - **Settle Debts**: Mark debts as paid/settled.
- **Out of Scope**: Image receipts, multi-currency (sticking to one), complex debt simplification (MPC), recurring expenses.

## 3. Implementation Decisions
- **Architecture**: Monorepo or separate client/server folders? Let's go with a simple **Client/Server separation**.
- **State Management**: React Context API or simple hooks for MVP speed.
- **Real-time**: Socket.io for the expense chat and instant balance updates.
- **Styling**: Vanilla CSS, polished with the signature **Splitwise theme** (teal/orange color palette).
- **Frontend structure**:
    - **Marketing Landing Page**: Public-facing `/` with hero section and feature grid.
    - **App Dashboard**: Protected `/dashboard` for group and balance overview.
    - **Group Detail**: Granular view of group members, expenses, and settlements.
    - **UI Pattern**: Left-hand sidebar navigation with a responsive main content area.

## 4. Engineering Requirements & Tech Stack
- **Frontend**: Vite, React, TypeScript.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: SQLite for development (portability), PostgreSQL for production. (Relational DB - Mandatory).
- **ORM**: Prisma (for type-safe database access).
- **Authentication**: JWT (JSON Web Tokens) stored in HTTP-only cookies or localStorage.
- **Real-time**: Socket.io.
- **Deployment**: 
    - **Frontend**: https://spreetrail-assignment.vercel.app (Vercel)
    - **Backend**: https://spreetrail-assignment-backend.onrender.com (Render)
    - **Database**: Managed PostgreSQL (Render)

## 5. Database Schema (Draft)
- `User`: id, email, password, name
- `Group`: id, name, created_by
- `GroupMember`: user_id, group_id
- `Expense`: id, description, amount, date, group_id, paid_by_id
- `Split`: id, expense_id, user_id, amount, split_type (EQUAL, EXACT, PERCENT, SHARE)
- `ChatMessage`: id, expense_id, user_id, message, created_at
- `Settlement`: id, from_id, to_id, amount, date, group_id

## 6. API Design (Draft)
- `POST /api/auth/register` | `POST /api/auth/login`
- `GET /api/groups` | `POST /api/groups`
- `GET /api/groups/:id/expenses` | `POST /api/groups/:id/expenses`
- `POST /api/expenses/:id/chat` | `GET /api/expenses/:id/chat`
- `POST /api/settle`

## 7. AI Collaboration Process
- **Initial Prompt**: User provided the assignment PDF and asked to build it.
- **Interview Phase**:
    - AI asked detailed questions about scope, stack, and workflows.
    - User Response: "do all as an experienced developer. Decide on your own".
- **Decision Resolution**: AI proposed a Vite/React/Node/PostgreSQL stack with Socket.io for real-time chat. This decision was documented here to satisfy the requirement of "not assuming" by explicitly stating the transition from interview to autonomous design at the user's request.

## 8. Known Limitations & Trade-offs
- Using a simple debt model instead of complex "simplify debts" algorithms for MVP speed.
- Basic JWT auth without refresh tokens for the 2-day window.
- Vanilla CSS might lack some "out-of-the-box" UI components, but allows for a unique, polished look.

---
*This file will be updated as the project evolves.*
