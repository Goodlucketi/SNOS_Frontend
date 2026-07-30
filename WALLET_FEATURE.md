# Wallet Feature Implementation

## Overview
This implementation adds a wallet feature to the SNOS platform that allows users to:
- View their wallet balance
- Top up their wallet using Paystack payment gateway
- View transaction history

## Files Created/Modified

### 1. New Files
- `src/pages/Wallet.tsx` - Main wallet page component
- `supabase/migrations/20240730_create_wallet_transactions.sql` - Database migration for wallet transactions table

### 2. Modified Files
- `src/components/SideBar.tsx` - Added Wallet to navigation sidebar
- `src/App.tsx` - Added route for wallet page
- `src/components/SideBar.tsx` - Added Banknote icon import

## Database Schema

### wallet_transactions Table
```sql
create table wallet_transactions (
    id uuid default uuid_generate_v4() primary key,
    client_id uuid references clients(id) on delete cascade not null,
    amount integer not null, -- stored in kobo (smallest currency unit)
    type text not null check (type in ('credit', 'debit')),
    status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
    reference text, -- payment gateway reference
    description text,
    paid_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
```

## How It Works

### Balance Storage
- Wallet balance is stored in the `clients.metadata` JSONB column as `wallet_balance`
- This follows the existing pattern used for other client metadata in the application

### Transaction Flow
1. When user initiates a top-up:
   - A pending transaction record is created in `wallet_transactions`
   - Paystack payment modal is opened
   - On successful payment:
     - Transaction status is updated to 'success'
     - Wallet balance in `clients.metadata` is updated
     - Transaction history is refreshed

### Security
- Row Level Security (RLS) is enabled on the `wallet_transactions` table
- Users can only view and insert their own transactions
- All transactions are linked to the authenticated user via `client_id`

## Usage
1. Users can access the wallet from the sidebar navigation
2. To top up:
   - Enter amount (minimum ₦100)
   - Click "Top Up Wallet"
   - Complete payment via Paystack
   - Balance updates immediately upon successful payment

## Dependencies
- Paystack SDK (already loaded in index.html)
- Existing Supabase client setup
- React Toastify for notifications
- Lucide React for icons

## Notes
- The implementation uses the same Paystack test key as the GuidedFlow component
- In production, you would want to use environment variables for the Paystack key
- The wallet balance is stored as a Naira amount but converted to kobo (smallest unit) for storage and payment processing