# Lokmoto Quick Start Guide

Get the Lokmoto admin panel running in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- npm installed
- Git installed

## Step 1: Environment Setup (2 minutes)

1. **Create environment file**
   ```bash
   # Copy the example file (or create manually if blocked)
   # Windows PowerShell:
   Copy-Item .env.example .env.local
   
   # Or manually create .env.local with these contents:
   ```

2. **Add to `.env.local`**:
   ```env
   VITE_SUPABASE_URL=https://rvufhbkmqfrjdcqoeyal.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2dWZoYmttcWZyamRjcW9leWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDIyNDUsImV4cCI6MjA3NTY3ODI0NX0.6o9CrU_4TPMIC8mKrf_gTWOwLGTEBDOCAmx2-ELFNjs
   VITE_SUPABASE_PROJECT_ID=rvufhbkmqfrjdcqoeyal
   
   VITE_SAFE2PAY_TOKEN=FD983FC0592D42A78E4B5B8D8126DFEA
   VITE_SAFE2PAY_SECRET_KEY=282C7084C765447D9623C35282AFBD6823AA978D49B646B68E35B5ECC3AF76BD
   VITE_SAFE2PAY_SANDBOX=true
   ```

## Step 2: Install Dependencies (2 minutes)

```bash
npm install
```

## Step 3: Link to Supabase (1 minute)

```bash
npm run supabase:link
```

**You'll be prompted for:**
- Database password (get from Supabase dashboard: Settings → Database → Password)

## Step 4: Apply Database Migrations (2 minutes)

```bash
npm run db:push
```

This creates all tables, enables RLS, sets up security policies, **and loads the initial vehicle categories** (8 categories: Street, Sport, Cruiser, Touring, Adventure, Scooter, Naked, Trail).

## Step 5: Create a Test User (2 minutes)

### Option A: Using Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/rvufhbkmqfrjdcqoeyal

2. Navigate to **Authentication → Users**

3. Click **"Add user"** → **"Create new user"**

4. Enter:
   - Email: `loja1@lokmoto.com`
   - Password: `Loja123456!`
   - Auto Confirm User: ✓ (check this!)

5. Click **"Create user"**

6. **Copy the UUID** from the created user (e.g., `a1b2c3d4-e5f6-...`)

7. Navigate to **Table Editor → rental_companies**

8. Click **"Insert row"**

9. Enter:
   ```
   id: [paste the UUID you copied]
   trading_name: Locadora Teste Ltda
   company_name: Locadora Teste
   email: loja1@lokmoto.com
   phone: 11999999999
   cnpj: 12345678000190
   subscription_status: active
   ```

10. Click **"Save"**

### Option B: Using SQL Editor

1. Go to Supabase Dashboard → **SQL Editor**

2. Click **"New Query"**

3. **First**, create the auth user in the dashboard (step 4 from Option A)

4. **Then** run this SQL (replace `USER_UUID_HERE` with the actual UUID):
   ```sql
   INSERT INTO rental_companies (
     id, 
     trading_name, 
     company_name, 
     email, 
     phone, 
     cnpj,
     subscription_status
   ) VALUES (
     'USER_UUID_HERE',
     'Locadora Teste Ltda',
     'Locadora Teste',
     'loja1@lokmoto.com',
     '11999999999',
     '12345678000190',
     'active'
   );
   ```

## Step 6: Start the Application (30 seconds)

```bash
npm run dev
```

Open your browser to: http://localhost:5173

## Step 7: Login & Test

1. Navigate to the login page

2. Enter credentials:
   - Email: `loja1@lokmoto.com`
   - Password: `Loja123456!`

3. Click **"Login"**

4. You should now see the dashboard!

5. Navigate to **Veículos** (Motorcycles) to test the new integrated page

## Testing the Motorcycle Feature

1. Click **"Cadastrar Motocicleta"** (Register Motorcycle)

2. Fill in the form:
   - Brand: Honda
   - Model: CB 600F Hornet
   - Version: ABS
   - Year: 2023
   - Plate: ABC-1234
   - Renavam: 12345678901
   - Chassis: 9BD12345678901234
   - Color: Vermelho
   - Engine Capacity: 600
   - Daily Rate: 150

3. Click **"Save"**

4. You should see the motorcycle appear in the list!

5. Try:
   - Searching for it
   - Viewing details
   - Editing it
   - Deleting it

## Troubleshooting

### "Failed to fetch"
- Check that Supabase URL and key are correct in `.env.local`
- Ensure you've applied migrations: `npm run db:push`

### "User not found" or login fails
- Verify the user exists in **both** `auth.users` AND `rental_companies` tables
- Check the UUIDs match
- Ensure "Auto Confirm User" was checked when creating the user

### "Permission denied" or "RLS policy violation"
- Check that the user ID in `rental_companies` matches the auth user ID
- Verify RLS policies were applied: `npm run db:push`
- Check the Supabase logs in the dashboard

### Migrations fail
- Ensure you're linked to the correct project: `npm run supabase:link`
- Check you have the correct database password
- Try applying migrations one by one:
  ```bash
  npx supabase db execute --file supabase/migrations/20250111000001_enable_extensions.sql
  # ... and so on
  ```

### Can't see motorcycles after creating them
- Open browser DevTools → Console tab
- Look for error messages
- Check Network tab for failed requests
- Verify the rental_companies.id matches your auth user ID

## What's Working

✅ **Authentication**
- Login/logout with Supabase Auth
- Role-based access (Rental Company)
- Secure session management

✅ **Motorcycles**
- View all your motorcycles
- Create new motorcycles
- Edit existing motorcycles
- Delete motorcycles
- Search motorcycles
- Real-time data from Supabase

✅ **Security**
- Row-Level Security (RLS)
- You can only see YOUR motorcycles
- Database-level protection

## What's NOT Working Yet

❌ **File Uploads** - Can't upload motorcycle images yet  
❌ **Proposals UI** - Still using mock data  
❌ **Dashboard** - Statistics not connected to real data  
❌ **Contracts** - Not implemented yet  
❌ **Real-time Updates** - Enabled in DB but not in UI  
❌ **Payment Integration** - Stub only

## Next Steps

After verifying everything works:

1. **Read the Documentation**
   - [README.md](./README.md) - Project overview
   - [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What was built
   - [docs/README.md](./docs/README.md) - Architecture guide

2. **Explore the Code**
   - Start with `src/presentation/hooks/useMotorcycles.ts`
   - Follow the data flow through the layers
   - See how Clean Architecture is applied

3. **Continue Development**
   - Migrate more pages to use real data
   - Implement file uploads
   - Add real-time features
   - Connect dashboard to real data

## Need Help?

1. Check [supabase/SETUP.md](./supabase/SETUP.md) for detailed setup
2. Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for what's implemented
3. Check Supabase dashboard logs for errors
4. Look at browser console for client-side errors

---

🎉 **Congratulations!** You now have a working Lokmoto admin panel with real Supabase integration!

