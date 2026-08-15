-- Afriframe Studio — Web Push support.
-- Run once in the Supabase SQL editor of the studio project.

create extension if not exists pg_net;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  role text not null default 'admin',
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

grant select, insert, update, delete on public.push_subscriptions to authenticated;
grant all on public.push_subscriptions to service_role;

alter table public.push_subscriptions enable row level security;

drop policy if exists "own devices" on public.push_subscriptions;
create policy "own devices" on public.push_subscriptions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Booking id on the in-CMS notification history (safe if it already exists).
alter table public.notifications add column if not exists booking_id uuid;

-- Dispatch pushes to the Afriframe CMS endpoint whenever bookings change.
create or replace function public.afriframe_push_dispatch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  evt text;
  dispatch_url text;
  hook_secret text;
begin
  if (tg_op = 'INSERT') then
    evt := 'booking.created';
  elsif (new.status is distinct from old.status) then
    if lower(new.status) = 'confirmed' then
      evt := 'booking.confirmed';
    elsif lower(new.status) = 'cancelled' then
      evt := 'booking.cancelled';
    end if;
  end if;

  if evt is null then
    return new;
  end if;

  select decrypted_secret into dispatch_url
    from vault.decrypted_secrets
   where name = 'AFRIFRAME_PUSH_DISPATCH_URL'
   limit 1;
  select decrypted_secret into hook_secret
    from vault.decrypted_secrets
   where name = 'AFRIFRAME_PUSH_HOOK_SECRET'
   limit 1;

  if dispatch_url is null or hook_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := dispatch_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-afriframe-hook', hook_secret
    ),
    body := jsonb_build_object('event', evt, 'bookingId', new.id)
  );

  return new;
end;
$$;

drop trigger if exists afriframe_push_on_booking on public.bookings;
create trigger afriframe_push_on_booking
  after insert or update of status on public.bookings
  for each row execute function public.afriframe_push_dispatch();
