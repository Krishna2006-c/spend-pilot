# Tests

## Manual Testing

### Test Case 1

Input:
- Cursor Business
- 2 seats

Expected:
- Downgrade recommendation

Result:
- Passed

---

### Test Case 2

Input:
- ChatGPT Team
- 1 seat

Expected:
- Switch to Plus recommendation

Result:
- Passed

---

### Test Case 3

Input:
- Large monthly spend

Expected:
- Generic optimization recommendation

Result:
- Passed

---

## Deployment Testing

- Verified production deployment on Vercel
- Verified Supabase database insertion
- Verified responsive UI
- Verified audit calculations