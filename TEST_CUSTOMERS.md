# Testing Customers Module - Quick Guide

## 🧪 Quick Test Workflow

### Prerequisites
- ✅ Be logged in as a rental company admin
- ✅ Have at least one vehicle in the database

---

## Test 1: Create a New Customer

### Step 1: Navigate to Customers
```
http://localhost:5173/clientes-loja
```

### Step 2: Click "Novo Cliente"

### Step 3: Fill Customer Data
**Personal Information:**
- Nome Completo: `João Silva`
- Email: `joao.silva@email.com`
- Telefone: `11987654321` (only numbers)
- CPF: `12345678900` (11 digits)

**Driver License (CNH):**
- Número da CNH: `12345678900`
- Categoria: `AB`
- Estado de Emissão: `SP`
- Data de Emissão: Select a past date (e.g., 2020-01-15)
- Data de Validade: Select a future date (e.g., 2026-01-15)

### Step 4: Click "Cadastrar Cliente"

### Expected Result:
- ✅ Success toast notification
- ✅ Redirect to customers list
- ✅ New customer appears in the list

---

## Test 2: View Customer Details

### Step 1: From Customers List
Click "Ver Detalhes" on the customer you just created.

### Expected Result:
- ✅ Customer name in header
- ✅ Personal information displayed correctly
- ✅ Formatted CPF: `123.456.789-00`
- ✅ Formatted phone: `(11) 98765-4321`
- ✅ CNH details shown
- ✅ CNH status badge: "Válida" (green)
- ✅ Quick actions sidebar

---

## Test 3: Edit Customer

### Step 1: From Details Page
Click "Editar" button.

### Step 2: Modify Some Fields
- Change phone to: `11999998888`
- Change CNH category to: `A`

### Step 3: Click "Atualizar Cliente"

### Expected Result:
- ✅ Success toast notification
- ✅ Redirect to details page
- ✅ Updated information displayed

---

## Test 4: Search Customers

### Step 1: Navigate to Customers List

### Step 2: Use Search Bar
Type in the search box:
- Try searching by name: `João`
- Try searching by email: `joao.silva`
- Try searching by CPF: `123456`

### Step 3: Press Enter or Click "Buscar"

### Expected Result:
- ✅ Only matching customers displayed
- ✅ Clear search to see all customers again

---

## Test 5: Test CNH Expiration Warning

### Step 1: Create Customer with Expired CNH

**Follow Test 1, but:**
- Set "Data de Validade" to a past date (e.g., 2023-01-01)

### Step 2: View Customer Details

### Expected Result:
- ✅ CNH status badge: "Vencida" (red)
- ✅ Warning message displayed
- ✅ Prominent red styling

---

## Test 6: Delete Customer

### Step 1: From Customer Details
Click "Excluir" button.

### Step 2: Confirm Deletion
Click "Excluir" in the confirmation dialog.

### Expected Result:
- ✅ Success toast notification
- ✅ Redirect to customers list
- ✅ Customer no longer appears in list

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to create customer: new row violates row-level security policy"
**Cause:** Rental company is not properly authenticated.
**Solution:** Ensure you're logged in as a valid rental company admin.

### Issue 2: Customer created but not appearing in list
**Cause:** RLS policies filtering the customer out.
**Solution:** Customers only appear after they have a proposal/contract with your company. This is by design for multi-tenancy.

### Issue 3: "Email already in use"
**Cause:** Supabase Auth already has a user with this email.
**Solution:** Use a different email address.

### Issue 4: Form validation errors
**Cause:** Invalid data format.
**Solution:** 
- CPF: Must be exactly 11 digits
- Phone: Must be at least 10 digits
- CNH: Must be exactly 11 digits
- Dates: Issuing date must be in the past, expiration date must be in the future

---

## 🔍 What to Check in Supabase Dashboard

### 1. Check `customers` Table
```sql
SELECT * FROM customers ORDER BY created_at DESC LIMIT 10;
```

Should show:
- Customer with correct data
- `id` matches a `auth.users.id`

### 2. Check `customer_driver_licenses` Table
```sql
SELECT * FROM customer_driver_licenses ORDER BY created_at DESC LIMIT 10;
```

Should show:
- Driver license linked to customer
- Correct dates and category

### 3. Check Auth Users
Go to: `Authentication → Users`

Should show:
- New user created with customer's email
- User metadata includes `full_name` and `role: 'customer'`

---

## ✅ Success Criteria

All tests passed if:
- ✅ Can create customers with CNH
- ✅ Can view customer details
- ✅ Can edit customer information
- ✅ Can search customers
- ✅ CNH expiration warning works
- ✅ Can delete customers
- ✅ All data is properly formatted
- ✅ No console errors
- ✅ Smooth UX with loading states

---

## 🎯 Next Integration Test

Once customers are working, test the integration with proposals:

1. Go to "Propostas"
2. Create a new proposal
3. You should be able to select the customer you just created
4. Complete the proposal → contract workflow

---

## 📊 Performance Check

- Page load time: < 2 seconds
- Search response: < 1 second
- Form submission: < 3 seconds
- No memory leaks on navigation

---

## 🆘 Need Help?

If tests fail:
1. Check browser console for errors
2. Check Supabase logs
3. Verify RLS policies are active
4. Ensure migration was applied correctly
5. Review `CUSTOMERS_MODULE_SUMMARY.md` for details

