# Security Specification for Gumfolio

## 1. Data Invariants
- A sale cannot exist without a valid product ID.
- Sales and products must belong to a specific user (the shop owner).
- Payouts are associated with a user and must reflect authentic payout data, not client-provided figures.
- Chat history belongs to the authenticated user and must not be accessible by other users.
- PII (email) in sales must be handled with strict read access controls.

## 2. The "Dirty Dozen" Payloads (Examples)
1. **Identity Theft:** `{"ownerId": "other_user_id"}` in a new sale document.
2. **State Shortcutting:** `{"status": "completed"}` without the required chain of approvals.
3. **Resource Poisoning:** `{"id": "a".repeat(2000)}` to exhaust ID index space.
4. **Email Spoofing:** `{"email": "admin@example.com"}` in a profile creation request, without verifying the auth token email.
5. **PII Leak:** An authenticated user trying to `get()` another user's PII via a blanket read.
6. **Orphaned Write:** A sale created with a `productId` that doesn't exist in the product collection.
7. **Type Mismatch:** A price field updated with a string instead of a number.
8. **Unauthorized List:** An authenticated user trying to list sales for a shop they don't own.
9. **Field Injection (Shadow Update):** Including `isVerified: true` in an update payload.
10. **Timestamp Tampering:** Providing a future date in `createdAt`.
11. **Illegal Delete:** Attempting to delete a sales record that should be immutable for financial reporting.
12. **Insecure Query:** Assuming the client will filter properly without rule enforcement.

## 3. Test Runner
[To be implemented in firestore.rules.test.ts]
