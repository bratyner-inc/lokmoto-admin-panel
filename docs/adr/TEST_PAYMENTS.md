# Testing Payments Module - Quick Guide

## 🧪 Quick Test Workflow

### Prerequisites
- ✅ Be logged in as a rental company admin
- ✅ Have at least one active contract
- ✅ Transactions migration applied

---

## Test 1: Generate Transactions for Active Contracts

### Step 1: Run Generation Function
In **Supabase Dashboard → SQL Editor**:

```sql
SELECT generate_monthly_transactions();
```

**Expected Result:**
- Returns a number (count of transactions created)
- If you have 3 active contracts, returns `3`

### Step 2: Verify in Database
```sql
SELECT 
    id,
    amount,
    due_date,
    status,
    description
FROM transactions
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
- Shows newly created transactions
- Status = `pending`
- Amount matches contract `monthly_value`

---

## Test 2: View Payments Page

### Step 1: Navigate to Payments
```
http://localhost:5173/pagamentos
```

### Step 2: Check Statistics Dashboard
Look for 4 stat cards showing:
- **Recebido** (Total Revenue) - Should show R$ 0,00 initially
- **Pendente** (Pending Amount) - Should show sum of all pending transactions
- **Em Atraso** (Overdue) - Should show count of overdue transactions
- **Total** - Should show total transaction count

### Expected Result:
- ✅ All cards load without errors
- ✅ Numbers match database

---

## Test 3: Filter Transactions

### Step 1: Use Search Bar
Type any text in the search box (e.g., "Mensalidade")

### Step 2: Filter by Status
Select "Pendente" from the status dropdown

### Step 3: Filter by Payment Method
Select "Boleto" from the payment method dropdown

### Expected Result:
- ✅ Table updates with filtered results
- ✅ All filters work together

---

## Test 4: View Transaction Details

### Step 1: Click Eye Icon
Click the eye icon on any transaction in the table

### Expected Result:
- ✅ Navigate to `/pagamentos/{id}`
- ✅ Shows full transaction information
- ✅ Displays customer and contract links (if available)
- ✅ Shows payment timeline

---

## Test 5: Mark Transaction as Paid

### Step 1: From List Page
Click the checkmark icon (green) on a pending transaction

OR

### Step 2: From Details Page
Click "Confirmar Pagamento" button

### Expected Result:
- ✅ Success toast notification
- ✅ Transaction status changes to "Pago" (Paid)
- ✅ Badge turns green with checkmark
- ✅ Statistics update (Recebido increases, Pendente decreases)

---

## Test 6: Test Safe2Pay Mock Service

### Step 1: Create Transaction Manually (via SQL)
```sql
INSERT INTO transactions (
    rental_company_id,
    customer_id,
    transaction_type,
    payment_method,
    status,
    amount,
    due_date,
    description,
    reference_month,
    reference_year
) VALUES (
    (SELECT id FROM rental_companies LIMIT 1), -- Your rental company
    (SELECT id FROM customers LIMIT 1), -- A customer
    'rental_payment',
    'pix',
    'pending',
    500.00,
    CURRENT_DATE + INTERVAL '7 days',
    'Test PIX Payment',
    EXTRACT(MONTH FROM NOW())::INTEGER,
    EXTRACT(YEAR FROM NOW())::INTEGER
);
```

### Step 2: View in App
- Navigate to `/pagamentos`
- Find the test transaction
- Click to view details

### Expected Result:
- ✅ Transaction appears in list
- ✅ Details page shows mock Safe2Pay data
- ✅ No actual API call made (using mock service)

---

## Test 7: Test Overdue Detection

### Step 1: Create Overdue Transaction
```sql
INSERT INTO transactions (
    rental_company_id,
    transaction_type,
    payment_method,
    status,
    amount,
    due_date,
    description,
    reference_month,
    reference_year
) VALUES (
    (SELECT id FROM rental_companies LIMIT 1),
    'rental_payment',
    'boleto',
    'pending',
    300.00,
    CURRENT_DATE - INTERVAL '5 days', -- 5 days ago
    'Overdue Test Transaction',
    EXTRACT(MONTH FROM NOW())::INTEGER,
    EXTRACT(YEAR FROM NOW())::INTEGER
);
```

### Step 2: View in App
Navigate to `/pagamentos`

### Expected Result:
- ✅ Transaction shows red "Em Atraso" badge
- ✅ "Em Atraso" stat card increases by 1
- ✅ Due date shown in red
- ✅ Warning banner in details page

---

## Test 8: Test Empty State

### Step 1: Create New Rental Company
Create a new rental company (or use one with no transactions)

### Step 2: Login as That Company
Login with the new company credentials

### Step 3: Navigate to Payments
Go to `/pagamentos`

### Expected Result:
- ✅ Shows empty state message
- ✅ No errors
- ✅ All stats show 0 or R$ 0,00

---

## Test 9: Test Copy-to-Clipboard

### Step 1: Create Transaction with Safe2Pay Data
```sql
UPDATE transactions
SET 
    safe2pay_transaction_id = 'MOCK_12345',
    safe2pay_barcode = '34191234567890123456789012345678901234567890',
    safe2pay_pix_qrcode = '00020126580014BR.GOV.BCB.PIX01361234567890123456789012345678520400005303986540550.005802BR5913TESTE PAYMENT6009SAO PAULO62070503***63041234'
WHERE id = (SELECT id FROM transactions LIMIT 1);
```

### Step 2: View Transaction Details
Navigate to the transaction details page

### Step 3: Click Copy Icons
Click the copy icons next to:
- Transaction ID
- Barcode
- PIX QR Code

### Expected Result:
- ✅ Toast notification "Copiado!"
- ✅ Value copied to clipboard
- ✅ Can paste the value

---

## Test 10: Test Revenue Calculations

### Step 1: Mark Multiple Transactions as Paid
Mark 3 transactions with different amounts as paid

### Step 2: Check Statistics
Navigate to `/pagamentos` and check:
- **Recebido** stat

### Step 3: Verify in Database
```sql
SELECT SUM(amount) as total_revenue
FROM transactions
WHERE status = 'paid';
```

### Expected Result:
- ✅ **Recebido** stat matches database sum
- ✅ Updates in real-time

---

## 🐛 Common Issues & Solutions

### Issue 1: "No transactions found"
**Cause:** No transactions generated yet  
**Solution:** Run `SELECT generate_monthly_transactions();` in SQL

### Issue 2: Statistics show 0 but transactions exist
**Cause:** RLS policies filtering transactions out  
**Solution:** Ensure you're logged in as the correct rental company

### Issue 3: "Failed to fetch transactions"
**Cause:** RLS policies too restrictive or migration not applied  
**Solution:** 
1. Check Supabase logs
2. Verify transactions table exists
3. Check RLS policies are correct

### Issue 4: Mock Safe2Pay data not showing
**Cause:** `VITE_USE_MOCK_PAYMENTS` not set  
**Solution:** Ensure `.env` has `VITE_USE_MOCK_PAYMENTS=true`

---

## ✅ Success Criteria

All tests passed if:
- ✅ Can generate transactions via function
- ✅ Can view transactions list
- ✅ Can filter and search
- ✅ Can view transaction details
- ✅ Can mark as paid
- ✅ Statistics update correctly
- ✅ Overdue detection works
- ✅ Empty state shows properly
- ✅ Copy-to-clipboard works
- ✅ Revenue calculations correct
- ✅ No console errors
- ✅ Smooth UX with loading states

---

## 🎯 Next Integration Test

Once payments are working, test the integration with contracts:

1. Go to "Contratos"
2. View a contract details page
3. **Future Feature:** See all transactions for that contract

---

## 📊 Performance Check

- Page load time: < 2 seconds
- Filter response: < 500ms
- Transaction generation: < 5 seconds for 100 contracts
- No memory leaks on navigation

---

## 🔄 Switch to Real Safe2Pay API

### Step 1: Get Credentials
Sign up at https://safe2pay.com.br/ and get API credentials

### Step 2: Update Environment
```env
VITE_USE_MOCK_PAYMENTS=false
VITE_SAFE2PAY_API_KEY=your_real_key
VITE_SAFE2PAY_API_SECRET=your_real_secret
```

### Step 3: Test Real Integration
1. Create a test transaction
2. Verify API call is made (check Network tab)
3. Check response contains real Safe2Pay data
4. Test actual payment flow

---

## 🆘 Need Help?

If tests fail:
1. Check browser console for errors
2. Check Supabase logs
3. Verify all migrations applied
4. Review `PAYMENTS_MODULE_SUMMARY.md` for details
5. Check `.env` configuration

