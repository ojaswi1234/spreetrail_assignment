# DECISIONS.md - Architectural Decision Log

This document records the significant decisions made during the development of the Shared Expenses App.

## 1. Database Choice: Relational (PostgreSQL/SQLite)
- **Decision**: Used Prisma with SQLite for local development and PostgreSQL for production.
- **Rationale**: Relational databases are superior for financial data (ACID compliance). Prisma ensures type-safety and easy migrations. SQLite provides zero-config portability for the assignment review.

## 2. Dynamic Membership Strategy: `joinedAt` and `leftAt`
- **Options Considered**:
    1. Filter expenses in the UI based on user join date.
    2. Physically add/remove users from the database.
    3. Use a junction table with dates.
- **Decision**: Junction table (`GroupMember`) with `joinedAt` and `leftAt`.
- **Rationale**: This is the most robust way to handle Sam's ("I moved in mid-April") and Meera's ("moved out end of March") requirements. It allows the same group to evolve over time while keeping historical debt calculation accurate.

## 3. Two-Step Import Process (Analyze -> Approve)
- **Decision**: The CSV import does not write directly to the primary tables. It first generates a draft report.
- **Rationale**: Directly satisfies Meera's requirement: "I want to approve anything the app deletes or changes." It prevents "silent guesses" which were explicitly called out as a failing answer in the assignment.

## 4. Simplified Debt Calculation: Greedy Min-Flow
- **Decision**: Implemented a greedy algorithm to reduce the total number of transactions needed to settle a group.
- **Rationale**: Satisfies Aisha's requirement: "I just want one number per person. Who pays whom, how much, done."

## 5. Explicit Balance Breakdown
- **Decision**: Clicking a user's balance shows the specific expenses contributing to it.
- **Rationale**: Satisfies Rohan's requirement: "No magic numbers... I want to see exactly which expenses make that up."

## 6. Currency Normalization at Ingestion
- **Decision**: Convert all foreign currencies (USD) to the base currency (INR) at the time of import, while storing the original metadata.
- **Rationale**: Satisfies Priya's requirement. Storing both original and converted amounts ensures transparency and allows for future auditing if the exchange rate needs adjustment.
