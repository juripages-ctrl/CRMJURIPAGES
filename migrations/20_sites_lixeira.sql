-- Add deleted_at column for soft delete
alter table public.sites add column if not exists deleted_at timestamp with time zone default null;
