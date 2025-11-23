# Task Selection Template

## Developer Information

- **Name**: Swikriti
- **Date**: November 23, 2025
- **Estimated Completion Time**: 10-12 hours

## Selected Tasks

### Merchants Management Features

#### Merchant List View (30 points available)

- ✅ Display merchant information in table format (10 pts)
- ✅ Search and filter by name, ID, or status (5 pts)
- ✅ Sort by various criteria (5 pts)
- ✅ Pagination for large datasets (5 pts)
- ✅ Loading states and error handling (5 pts)

**Subtotal from this feature**: **30 points**

**Implementation Details**:

- Created `MerchantTable.tsx` component with full table display functionality
- Implemented `MerchantFilters.tsx` for search by name and ID
- Added sorting by name (ascending/descending) and ID (ascending/descending)
- Implemented pagination with previous/next navigation
- Added loading spinner and error handling states
- Used custom `useMerchants` hook for data fetching

---

#### Add New Merchant (25 points available)

- ✅ Form with merchant details (name, email, phone) (8 pts)
- ✅ Business information and registration (5 pts)
- ✅ Submit to POST /api/v1/merchants (5 pts)
- ✅ Input validation and error handling (4 pts)
- ✅ Success notifications and form reset (3 pts)

**Subtotal from this feature**: **25 points**

**Implementation Details**:

- Created `MerchantForm.tsx` component with comprehensive form fields
- Implemented fields for personal details (name, email, phone)
- Added business information fields (business name, category, PAN)
- Integrated with `createMerchant` API service (POST endpoint)
- **Frontend Validation** - Added comprehensive client-side validation for all form fields including:
  - Required field validation (all fields mandatory)
  - Email format validation (regex pattern validation)
  - **Phone number validation with strict 10-digit restriction** (prevents input beyond 10 digits)
  - PAN format validation
  - Real-time error display as user types (after first submit attempt)
- **Backend Validation Handling** - Implemented React Hot Toast notifications to display backend validation errors:
  - Duplicate email detection (shows error if email already exists in database)
  - Duplicate phone number detection (shows error if phone already exists in database)
  - Duplicate PAN detection (shows error if PAN already exists in database)
- Form auto-resets after successful submission
- Modal-based form with open/close functionality
- Success toast notification on successful merchant creation

---

#### Edit Merchant Details (20 points available)

- ✅ Pre-populate form with existing data (5 pts)
- ✅ Update contact details and address (5 pts)
- ✅ Manage merchant status (active/inactive) (5 pts)
- ✅ Submit to PUT /api/v1/merchants/:id (3 pts)
- ✅ Confirmation dialogs (2 pts)

**Subtotal from this feature**: **20 points**

**Implementation Details**:

- Created `UpdateMerchant.tsx` page for editing merchant details
- Pre-populated form with existing merchant data fetched via `getMerchantById`
- Implemented edit mode toggle functionality
- Added ability to update:
  - Contact details (name, email, phone)
  - Business information (business name, category, PAN)
  - Merchant status (active/inactive toggle)
- Integrated with `updateMerchant` API service (PUT endpoint)
- **Frontend Validation** - Same comprehensive validation as create form:
  - Required field validation for all fields
  - Email format validation
  - **Phone number validation with 10-digit restriction**
  - PAN format validation
- **Backend Validation Handling** - React Hot Toast displays backend errors during update:
  - Duplicate email detection (if trying to update to an email that already exists)
  - Duplicate phone number detection (if trying to update to a phone that already exists)
  - Duplicate PAN detection (if trying to update to a PAN that already exists)
- Implemented `ConfirmDialog` component for confirmation before saving changes
- Change detection to track if user made any modifications
- Success toast notification on successful update
- Navigation back to merchants list after successful update

---

#### Merchant Details View (25 points available)

- ✅ Display complete merchant profile (5 pts)
- ✅ Show transaction statistics (8 pts)
- ✅ List recent transactions (7 pts)
- ✅ View merchant activity timeline (3 pts)
- ✅ Export transaction history (2 pts)

**Subtotal from this feature**: **25 points**

**Implementation Details**:

- Created `MerchantDetails.tsx` page with comprehensive merchant profile display
- Displayed all merchant information including:
  - Personal details (name, email, phone)
  - Business information (business name, category, PAN)
  - Account status and creation date
- **Transaction API Integration**:
  - Integrated `getTransactions` API from `transactionService.ts`
  - API endpoint: `GET /api/v1/merchants/{merchantId}/transactions`
  - Merchant ID formatting: Converts numeric ID (e.g., 1) to formatted ID (e.g., MCH-00001) before API call
  - Passes pagination parameters (page: 0, size: 10) to fetch recent transactions
  - Handles API errors gracefully (displays message if no transactions available)
- Implemented transaction statistics showing:
  - Total transactions count
  - Breakdown by status (completed, pending, failed)
  - Total transaction amount
  - Statistics calculated from fetched transaction data
- Listed recent transactions (10 most recent) with details:
  - Transaction ID, amount, status, payment method
  - Formatted date and time
- Added transaction status timeline/activity view
- Implemented CSV export functionality for transaction history
- Used Card components for organized layout
- Proper merchant ID formatting (e.g., MCH-00001)

---

## Summary

**Total Selected Points**: **100 / 100 points**

### Point Breakdown by Area

- Merchants Management: **100 points** (All 4 features completed)
- Reports & Analytics: **0 points**

---

## Implementation Plan

### Approach

I implemented a complete merchant management system focusing on CRUD operations and detailed merchant views. The approach was component-based using React and TypeScript, with a clear separation of concerns between UI components, services, and custom hooks.

### Order of Implementation

1. **Add New Merchant** - Created form component with validation and modal-based UI
2. **Merchant List View** - Established foundation with table display, pagination, and API integration using `useMerchants` hook
3. **Edit Merchant Details** - Implemented update functionality with pre-populated forms and confirmation dialogs
4. **Merchant Details View** - Built comprehensive details page showing profile and transaction statistics

### Technical Decisions

- **React + TypeScript**: Used for type safety and better developer experience
- **Custom Hooks**: Created `useMerchants` and `useTransactions` hooks for data fetching and state management
- **Component Library**: Built reusable components (Button, Input, Card, Table, LoadingSpinner, ConfirmDialog)
- **React Router**: Used for navigation between merchant list, details, and edit pages
- **React Hot Toast**: Implemented for user-friendly success/error notifications
- **CSS Modules**: Used separate CSS files for component-specific styling
- **API Service Layer**: Created `merchantService.ts` and `transactionService.ts` for API abstraction

### API Endpoints Implemented

#### Merchant APIs (`merchantService.ts`)

1. **GET /api/v1/merchants** - Fetch all merchants with pagination and filters

   - Parameters: page, limit, search, category, status
   - Used in: Merchant List View

2. **GET /api/v1/merchants/:id** - Fetch single merchant by ID

   - Parameters: merchantId
   - Used in: Merchant Details View, Update Merchant (to pre-populate form)

3. **POST /api/v1/merchants** - Create new merchant

   - Body: name, email, phone, businessName, category, pan
   - Used in: Add New Merchant Form

4. **PUT /api/v1/merchants/:id** - Update existing merchant

   - Parameters: merchantId
   - Body: name, email, phone, businessName, category, pan, status
   - Used in: Update Merchant Form

5. **POST /api/v1/merchants/search** - Search merchants by name or ID
   - Body: searchName, searchId, page, limit
   - Used in: Merchant List View (search/filter functionality)

#### Transaction API (`transactionService.ts`)

1. **GET /api/v1/merchants/:merchantId/transactions** - Fetch transactions for a merchant
   - Parameters: merchantId, page, size, startDate, endDate, status
   - Used in: Merchant Details View (to show recent transactions and statistics)

### Technical Stack

- **Frontend Framework**: React with TypeScript
- **Routing**: React Router DOM
- **State Management**: React hooks (useState, useEffect, useMemo)
- **HTTP Client**: Fetch API wrapped in service functions
- **Notifications**: React Hot Toast
- **Styling**: CSS with component-specific stylesheets

### Key Features Implemented

1. **Merchant Table**:

   - Sortable columns (name, ID)
   - Search by name or merchant ID
   - Pagination with page navigation
   - Click-through to details view
   - Edit and view action buttons

2. **Add Merchant Form**:

   - Modal-based form
   - Full validation with error messages
   - Fields: name, email, phone, business name, category, PAN
   - Auto-refresh table after creation
   - Toast notifications

3. **Merchant Details**:

   - Complete profile display
   - Transaction statistics (total, by status, amount)
   - Recent transactions list
   - CSV export functionality
   - Navigation to edit page

4. **Edit Merchant**:
   - Pre-populated form fields
   - Toggle edit mode
   - Status management (active/inactive)
   - Confirmation dialog before saving
   - Toast notifications

### Timeline

- Task selection: November 21, 2025
- Start implementation: November 21, 2025
- Target completion: November 23, 2025

---

## Notes

### Completed Implementation Highlights:

- All merchant management features (100 points) fully implemented
- Comprehensive error handling and loading states throughout
- Responsive and user-friendly UI
- Type-safe implementation with TypeScript
- Reusable component architecture
- Clean code structure with proper separation of concerns

### Files Created/Modified:

**Pages**:

- `Merchants.tsx` - Main merchant list page
- `MerchantDetails.tsx` - Detailed merchant view with transactions
- `UpdateMerchant.tsx` - Edit merchant page

**Components**:

- `MerchantTable.tsx` - Table component with sorting and pagination
- `MerchantForm.tsx` - Form for adding new merchants
- `MerchantFilters.tsx` - Search and filter controls

**Services**:

- `merchantService.ts` - API service for merchant operations
- `transactionService.ts` - API service for transaction data

**Hooks**:

- `useMerchants.ts` - Custom hook for merchant data fetching
- `useTransactions.ts` - Custom hook for transaction data fetching

**Types**:

- `merchant.ts` - TypeScript interfaces for merchant data
- `transaction.ts` - TypeScript interfaces for transaction data

---
