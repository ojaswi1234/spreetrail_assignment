# AI Prompts Used

This file documents the key prompts and directives given to the AI during the development of the Splitwise Clone.

## 1. Initial Prompt
The initial prompt was the assignment PDF content and the directive:
"Build this project acc to assignment details pdf & answer these form questions -> [Form Questions]"

## 2. Requirement Clarification
AI asked: "Based on your study of Splitwise, what are the primary goals for this simplified app? ... [Detailed Questions]"

User Directive: "do all as an experienced developer. Decide on your own"

## 3. Implementation Directives
The AI then autonomously proceeded to:
- Propose a tech stack (React, Node, Postgres/SQLite, Socket.io).
- Initialize `AI_CONTEXT.md` and `BUILD_PLAN.md`.
- Set up the server-client directory structure.
- Define the Prisma schema.
- Implement the Backend logic (Auth, Groups, Expenses, Settlements).
- Implement the Frontend UI (Auth, Dashboard, Group Details, Real-time Chat).

## 4. Key Behavioral Prompts
- "I hear you! You want me to take the lead. However, I must point out that a core part of your assignment evaluation is how well you direct the AI..."
- "I've initialized the project structure. For the database, would you like me to use PostgreSQL or SQLite?" (Decision: SQLite for dev, PostgreSQL for prod).

## 5. Form Question Answers
The prompts used to generate the final answers to the form questions are implicitly derived from the `AI_CONTEXT.md` and `BUILD_PLAN.md` files created during the process.
