-- Create wallet_transactions table
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

-- Enable Row Level Security
alter table wallet_transactions enable row level security;

-- Create policies for wallet_transactions
create policy "Users can view their own transactions"
on wallet_transactions for select
using (auth.uid() = client_id);

create policy "Users can insert their own transactions"
on wallet_transactions for insert
with check (auth.uid() = client_id);

create policy "Users can update their own transactions"
on wallet_transactions for update
using (auth.uid() = client_id);

-- Create updated_at trigger
create trigger update_wallet_transactions_updated_at
    before update on wallet_transactions
    for each row
    execute procedure moddatetime (updated_at);

-- Create indexes for better performance
create index idx_wallet_transactions_client_id on wallet_transactions(client_id);
create index idx_wallet_transactions_created_at on wallet_transactions(created_at desc);