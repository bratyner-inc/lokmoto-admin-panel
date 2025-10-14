# Tickets System Testing Guide

## 🎯 Overview
This guide provides step-by-step instructions for testing the Tickets System functionality.

## 📋 Prerequisites
1. Database migrations applied (run migrations if not done):
   ```bash
   npm run db:push
   ```

2. Seed data loaded (optional, for test tickets):
   ```bash
   # Run seed via Supabase Dashboard SQL Editor
   # or via CLI if configured
   ```

3. Dev server running:
   ```bash
   npm run dev
   ```

4. Logged in as a Store Admin user

## 🧪 Test Cases

### Test 1: View Tickets List
**Objective**: Verify tickets list page displays correctly

**Steps**:
1. Navigate to **Tickets** from the sidebar
2. Verify the page loads without errors
3. Check that statistics cards display:
   - Total tickets
   - Open tickets
   - In Progress tickets
   - Closed tickets
   - Urgent tickets

**Expected Result**: 
- Statistics cards show correct counts
- If seed data loaded, tickets appear in the list
- Each ticket card shows: title, description, status, priority, type, creation date

---

### Test 2: Filter Tickets
**Objective**: Test filtering functionality

**Steps**:
1. On the Tickets list page, use the search box to search for a keyword
2. Use the Status dropdown to filter by "Aberto" (Open)
3. Use the Priority dropdown to filter by "Alta" (High)
4. Use the Type dropdown to filter by "Defeito" (Defect)
5. Clear filters and verify all tickets reappear

**Expected Result**: 
- Search narrows down tickets by title/description
- Status filter shows only tickets with selected status
- Priority filter shows only tickets with selected priority
- Type filter shows only tickets with selected type
- Clearing filters shows all tickets again

---

### Test 3: Create New Ticket (Without Attachments)
**Objective**: Create a ticket without file attachments

**Steps**:
1. Click **"Novo Ticket"** button
2. Select a contract from the dropdown
3. Verify customer and motorcycle info auto-populate
4. Select Ticket Type: "Defeito"
5. Select Priority: "Alta"
6. Enter Title: "Motor fazendo barulho"
7. Enter Description: "O motor da moto está fazendo um barulho estranho ao acelerar. Parece ser algo na corrente de transmissão."
8. Click **"Criar Ticket"**

**Expected Result**: 
- Form validates all required fields
- Success toast message appears
- Redirected to tickets list
- New ticket appears in the list

---

### Test 4: Create Ticket with Photo Attachments
**Objective**: Create a ticket with multiple photos

**Steps**:
1. Click **"Novo Ticket"** button
2. Fill in basic ticket information (contract, type, priority, title, description)
3. In the "Fotos" section, click to upload photos
4. Select up to 3 image files (JPG, PNG)
5. Verify image previews appear
6. Try to upload a 4th image (should be blocked)
7. Remove one photo by clicking the X button
8. Click **"Criar Ticket"**

**Expected Result**: 
- Up to 3 photos can be added
- Image previews display correctly
- 4th photo is blocked with a toast message
- Photos can be removed before submission
- Ticket created successfully with attachments
- Success toast appears

---

### Test 5: Create Ticket with Document Attachment
**Objective**: Create a ticket with a document

**Steps**:
1. Click **"Novo Ticket"** button
2. Fill in basic ticket information
3. In the "Documento" section, click to upload a document
4. Select a PDF, DOC, or DOCX file
5. Verify document name appears
6. Try to upload a 2nd document (should replace the first)
7. Click **"Criar Ticket"**

**Expected Result**: 
- Document file can be uploaded
- Document name displays
- Only 1 document allowed at a time
- Ticket created successfully with document attachment

---

### Test 6: File Upload Validation
**Objective**: Test file upload restrictions

**Steps**:
1. Click **"Novo Ticket"** button
2. Try to upload a non-image file as a photo (e.g., .txt file)
3. Try to upload a file larger than 5MB
4. Verify validation messages appear

**Expected Result**: 
- Non-image files rejected for photos
- Files over 5MB rejected
- Appropriate error toast messages display

---

### Test 7: View Ticket Details
**Objective**: View detailed ticket information

**Steps**:
1. From the tickets list, click **"Ver Detalhes"** on any ticket
2. Verify all ticket information displays:
   - Title, ticket number
   - Status, priority, type badges
   - Description
   - Contract information
   - Customer information
   - Motorcycle information
   - Timeline (created, updated, closed dates)
3. If ticket has attachments, verify they appear
4. Click on an attachment to view/download it

**Expected Result**: 
- All ticket details display correctly
- Related information (contract, customer, motorcycle) shows correctly
- Attachments are clickable and open in new tab
- Images display as thumbnails/previews
- Documents show with file icon

---

### Test 8: Update Ticket Status (Open → In Progress)
**Objective**: Change ticket status to In Progress

**Steps**:
1. Open a ticket with "Aberto" (Open) status
2. Scroll to the "Atualizar Status" section
3. Select "Em Andamento" (In Progress) from the dropdown
4. Click **"Atualizar Status"**
5. Verify success toast appears
6. Check that status badge updates to "Em Andamento"

**Expected Result**: 
- Status dropdown shows all status options
- Status updates successfully
- Badge updates to show new status
- Success toast appears

---

### Test 9: Close Ticket with Resolution
**Objective**: Close a ticket and add resolution details

**Steps**:
1. Open a ticket with "Em Andamento" (In Progress) status
2. In the "Atualizar Status" section, select "Fechado" (Closed)
3. Verify "Detalhes da Resolução" textarea appears
4. Enter resolution details: "Problema resolvido. A corrente estava solta e foi ajustada. Teste realizado com sucesso."
5. Click **"Atualizar Status"**
6. Verify the ticket details page updates with:
   - Status badge showing "Fechado"
   - Resolution details displayed
   - "Fechado em" date in the timeline

**Expected Result**: 
- Resolution textarea appears when "Fechado" selected
- Update button disabled until resolution entered
- Ticket closes successfully
- Resolution details display correctly
- Timeline shows closure date

---

### Test 10: Edit Ticket
**Objective**: Edit existing ticket information

**Steps**:
1. Open any ticket details page
2. Click **"Editar"** button
3. Modify the title, description, priority, or type
4. Add a new photo attachment
5. Remove an existing attachment (if any)
6. Click **"Atualizar Ticket"**

**Expected Result**: 
- Form pre-populates with existing ticket data
- Contract field is disabled (cannot change contract)
- Existing attachments display with remove option
- New attachments can be added
- Ticket updates successfully
- Redirected to tickets list with success toast

---

### Test 11: Delete Ticket
**Objective**: Delete a ticket

**Steps**:
1. Open any ticket details page
2. Click **"Excluir"** button
3. Verify confirmation dialog appears
4. Click **"Excluir"** in the dialog
5. Verify success toast appears
6. Verify redirect to tickets list
7. Confirm deleted ticket no longer appears in the list

**Expected Result**: 
- Confirmation dialog appears
- Clicking "Cancelar" cancels deletion
- Clicking "Excluir" deletes the ticket
- Success toast appears
- Redirected to tickets list
- Ticket removed from list

---

### Test 12: Navigation and Routing
**Objective**: Test all ticket-related routes

**Steps**:
1. Test `/tickets` - list page
2. Test `/tickets/novo` - create form
3. Test `/tickets/:id` - details page
4. Test `/tickets/editar/:id` - edit form
5. Navigate between pages using browser back/forward
6. Test sidebar navigation to Tickets

**Expected Result**: 
- All routes load correctly
- Browser navigation works properly
- Sidebar link highlights when on Tickets pages
- No console errors

---

### Test 13: Empty States
**Objective**: Verify empty state messages

**Steps**:
1. If you have tickets, temporarily filter them all out (e.g., search for "xyz123nonexistent")
2. Verify empty state message appears
3. If no tickets exist, verify the "create first ticket" empty state

**Expected Result**: 
- Empty state shows appropriate message
- "Criar Ticket" button appears when no tickets exist
- Helpful message about adjusting filters appears when filters active

---

### Test 14: Responsive Design
**Objective**: Test UI on different screen sizes

**Steps**:
1. Resize browser window to mobile size (< 768px)
2. Test tickets list page
3. Test ticket form page
4. Test ticket details page
5. Verify all elements remain accessible and readable

**Expected Result**: 
- Responsive grid layout adjusts correctly
- Forms remain usable on mobile
- Filters stack vertically on mobile
- No horizontal scrolling required
- All buttons and links remain clickable

---

### Test 15: Performance Test
**Objective**: Test with multiple tickets

**Steps**:
1. Create 10-15 tickets with various statuses, priorities, and types
2. Test list page loading time
3. Test filtering performance
4. Test search functionality with many results

**Expected Result**: 
- List loads quickly (< 2 seconds)
- Filtering is instant
- Search responds quickly
- No lag in UI interactions

---

### Test 16: Integration with Contracts
**Objective**: Verify ticket-contract relationship

**Steps**:
1. Create a ticket for a specific contract
2. Navigate to that contract's details page (if contract details shows tickets)
3. Verify the ticket appears linked to the contract
4. Try to create a ticket for an inactive contract (should not be possible)

**Expected Result**: 
- Only active contracts appear in ticket creation dropdown
- Ticket correctly links to selected contract
- Contract information displays correctly in ticket details

---

## 🔍 Edge Cases to Test

### Edge Case 1: Large Files
- Try uploading files close to the 5MB limit
- Verify proper error handling for files over 5MB

### Edge Case 2: Special Characters
- Create ticket with special characters in title/description
- Verify proper display and storage

### Edge Case 3: Long Text
- Create ticket with very long description (1000+ characters)
- Verify text displays correctly and is scrollable

### Edge Case 4: Concurrent Edits
- Open same ticket in two browser tabs
- Edit in one tab, then edit in another
- Verify behavior (may show stale data without refresh)

### Edge Case 5: File Upload Failure
- Disconnect internet mid-upload (if possible in testing)
- Verify error handling

---

## ✅ Checklist

Use this checklist to track your testing progress:

- [ ] Test 1: View Tickets List
- [ ] Test 2: Filter Tickets
- [ ] Test 3: Create New Ticket (Without Attachments)
- [ ] Test 4: Create Ticket with Photo Attachments
- [ ] Test 5: Create Ticket with Document Attachment
- [ ] Test 6: File Upload Validation
- [ ] Test 7: View Ticket Details
- [ ] Test 8: Update Ticket Status (Open → In Progress)
- [ ] Test 9: Close Ticket with Resolution
- [ ] Test 10: Edit Ticket
- [ ] Test 11: Delete Ticket
- [ ] Test 12: Navigation and Routing
- [ ] Test 13: Empty States
- [ ] Test 14: Responsive Design
- [ ] Test 15: Performance Test
- [ ] Test 16: Integration with Contracts
- [ ] Edge Case 1: Large Files
- [ ] Edge Case 2: Special Characters
- [ ] Edge Case 3: Long Text
- [ ] Edge Case 4: Concurrent Edits
- [ ] Edge Case 5: File Upload Failure

---

## 🐛 Bug Reporting

If you encounter any issues during testing, please note:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and version
5. Console errors (if any)
6. Screenshots (if applicable)

---

## 📸 Testing Tips

1. **Use Browser DevTools**: Check the Network tab for API calls and Console for errors
2. **Test Different Browsers**: Chrome, Firefox, Safari, Edge
3. **Use Real Data**: Test with realistic ticket scenarios
4. **Test Permissions**: Verify RLS policies work correctly (requires multiple test accounts)
5. **Monitor Database**: Check Supabase Dashboard to verify data is stored correctly

---

**Happy Testing! 🚀**

