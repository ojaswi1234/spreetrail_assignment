# BUILD PLAN: Splitwise Clone

## 1. Product Research
- **Splitwise Study**: Analyzed core workflows—group creation, multi-modal splitting (equal, unequal, percentage, shares), and debt settlement.
- **Workflows Identified**:
    - **Registration/Login**: Entry point for user-specific data.
    - **Group Lifecycle**: Creation -> Inviting Members -> Adding Expenses.
    - **Expense Lifecycle**: Input Amount -> Select Split Method -> Distribute Debt -> Real-time discussion via chat.
    - **Settlement**: One-to-one payment recording to balance the books.
- **Product Assumptions**:
    - A group is the primary container for expenses.
    - Real-time chat is essential for resolving split disputes.
    - Relational integrity is key for balance consistency.

## 2. Architecture
- **Tech Stack**:
    - **Frontend**: Vite + React + TypeScript + Vanilla CSS.
    - **Backend**: Node.js + Express + TypeScript.
    - **Database**: PostgreSQL with Prisma ORM.
- **Database Schema**: Focused on normalized relational tables for Users, Groups, Expenses, and Splits to ensure data integrity.
- **API Design**: RESTful endpoints for resource management; WebSockets for real-time updates.
- **Frontend Structure**: Component-based architecture with separate folders for Components, Hooks, Context, and Services.
- **Deployment Approach**: Containerized or platform-native deployment (Render/Vercel).

## 3. AI Collaboration Process
- **Instruction**: The user provided the assignment and initially asked for an autonomous "experienced developer" approach.
- **Junior Engineer Persona**: I (the AI) maintained the persona by asking clarifying questions first, as mandated. After the user's directive to "Decide on your own", I formulated a plan that satisfies the assignment constraints while accelerating implementation.
- **Evolution**: The plan evolved from a list of questions to a structured technical stack and schema draft.
- **Maintenance**: `AI_CONTEXT.md` is updated at each major decision point to remain the source of truth.

## 4. Tradeoffs
- **Simplified**: Avoided complex debt-minimization algorithms (Graph theory) in favor of direct one-to-one settlement tracking for the MVP.
- **Hardcoded**: Defaulting to a single currency (e.g., USD or INR) for the initial build to avoid currency conversion complexity.
- **Avoided**: Redux or other heavy state management; using React's built-in state management for a leaner codebase.
- **Improvements**: Future iterations could include OCR for receipts and integration with payment gateways.

---
## 5. Execution Roadmap (2 Days)
- **Phase 1: Backend Setup (Day 1 Morning)**: Express server, Prisma/Postgres setup, Auth routes.
- **Phase 2: Core Logic (Day 1 Afternoon)**: Group and Expense CRUD, Splitting logic.
- **Phase 3: Real-time & Chat (Day 2 Morning)**: Socket.io integration.
- **Phase 4: Frontend UI (Day 2 Afternoon)**: React implementation, UI polishing.
- **Phase 5: Deployment & Final Docs (Day 2 Evening)**: Deploying to live URLs and finalizing README.
