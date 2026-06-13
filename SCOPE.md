# SCOPE.md - Anomaly Log & Database Schema

## 1. Database Schema

The application uses **PostgreSQL** (with **SQLite** for local development portability) via **Prisma ORM**.

### Models:
- **User**: Core user data and credentials.
- **Group**: Containers for shared expenses.
- **GroupMember**: Junction table with `joinedAt` and `leftAt` to handle dynamic membership (Sam/Meera).
- **Expense**: Stores amount (INR), original currency/amount, split type, and metadata.
- **ExpenseSplit**: Link between users and expenses, storing specific owed amounts.
- **Settlement**: Records of payments made to settle debts.
- **ImportLog**: Audit trail for CSV imports.
- **ImportAnomaly**: Detailed records of every issue found during import.

## 2. Anomaly Log (CSV Data Problems)

The `expenses_export.csv` contained several deliberate data problems. Our importer identifies and handles them as follows:

| # | Anomaly Type | Example Row | Resolution Policy |
|---|--------------|-------------|-------------------|
| 1 | Duplicate Entry | Dinner at Marina Bites (Row 5 & 6) | **Skip**: Second identical entry on the same day is ignored. |
| 2 | Missing Payer | House cleaning supplies (Row 13) | **Skip**: Cannot process without a valid payer. |
| 3 | Missing Amount | Dinner order Swiggy (Row 30) | **Skip**: Zero or missing amounts are not valid expenses. |
| 4 | Name Case/Var | "priya" vs "Priya" | **Normalize**: Trim and case-insensitive matching to system users. |
| 5 | Date Mess | 01/03/2026, Mar 14 | **Normalize**: Multiple parser patterns (ISO, DMY, MMM DD) used. |
| 6 | Foreign Currency | Goa villa booking (USD) | **Adjust**: Convert to INR using a fixed rate (1 USD = 83 INR). |
| 7 | Missing Currency | Groceries DMart (Row 27) | **Adjust**: Assume default (INR) and log as anomaly. |
| 8 | Settlement-as-Exp | Rohan paid Aisha back | **Convert**: Identified as a `Settlement` record instead of an `Expense`. |
| 9 | Number Format | "1,200" (Row 7) | **Normalize**: Strip commas before parsing as float. |
| 10| Future Member | Sam deposit (Row 37) | **Exclude**: Sam is not charged for March electricity because of his `joinedAt` date. |
| 11| Former Member | Groceries BigBasket (Row 35) | **Adjust**: Meera is removed from the split as she left in March. |
| 12| Split Conflict | Equal vs Shares (Row 41) | **Policy**: Use `split_type` (Equal) and ignore conflicting `split_details`. |
| 13| Over-precision | Cylinder refill (899.995) | **Normalize**: Round to 2 decimal places. |
| 14| Negative Amount | Parasailing refund (-30) | **Allow**: Processed as a negative expense (refund). |
| 15| Conflicting Log | Thalassa dinner (Aisha & Rohan) | **Manual Review**: Surfaced in report; Aisha's is marked as potential error based on notes. |
| 16| Missing split data | Rohan birthday cake | **Adjust**: Exclude the payer from the split automatically based on context (notes). |
