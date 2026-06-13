# AI_USAGE.md - AI Collaboration Report

## 1. AI Tool Used
- **Primary Tool**: Gemini CLI (interactive agent).
- **Secondary Tools**: None.

## 2. Key Prompts
- "Analyze the expenses_export.csv file to design the database schema and plan the build."
- "Create an implementation plan that addresses the specific persona requests (Aisha, Rohan, Priya, Sam, Meera)."
- "Build the CSV import logic with a two-step approval process."

## 3. Concrete Cases of AI Errors & Corrections

### Case 1: Prisma 7 Migration Syntax
- **AI Output**: Produced a schema with `url = env("DATABASE_URL")` which triggered a P1012 error in Prisma 7 because of new configuration rules.
- **How I Caught It**: Migration failed with a specific validation error about datasource properties.
- **Change**: Downgraded to Prisma 6 to maintain stability and use the familiar schema-based configuration suitable for this 2-day sprint.

### Case 2: Incomplete Balance Logic
- **AI Output**: Initially suggested a balance calculation that only looked at the `Expense` table, ignoring `Settlement` records.
- **How I Caught It**: During the "Research -> Strategy" phase, I realized that recording a payment (settlement) must offset the debt, or Aisha's "one number" requirement would never be met.
- **Change**: Refactored the balance engine to treat Settlements as balance-adjusting events.

### Case 3: CSV Payer Matching
- **AI Output**: The AI's first draft of the CSV parser used strict string equality for payer names (e.g., `row.paid_by === user.name`).
- **How I Caught It**: Noticed "priya" (lowercase) and "Priya S" in the CSV which would fail strict matching against the "Priya" user.
- **Change**: Implemented a normalization utility that trims, lowercases, and performs partial matches (e.g., checking if the CSV name starts with the system name).
