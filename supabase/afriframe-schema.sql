-- =====================================================================
-- Afriframe Studio — Availability (global default + date overrides)
-- and Notifications.
-- Run this ONCE in the Supabase SQL Editor of project cylydjfpqmhzkcsipvmm.
-- It is idempotent: safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. GLOBAL SETTINGS (single row, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.studio_settings (
  id                          smallint primary key default 1 check (id = 1),
  default_max_bookings_per_day integer not null default 3 check (default_max_bookings_per_day >= 0),
  default_time_slots          text[] default null,
  booking_horizon_days        integer not null default 90 check (booking_horizon_days between 1 and 365),
  auto_waitlist               boolean not null default false,
  admin_email                 text,
  admin_whatsapp              text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

insert into public.studio_settings (id) values (1) on conflict (id) do nothing;

grant select on public.studio_settings to anon;
grant select, update on public.studio_settings to authenticated;
grant all on public.studio_settings to service_role;

alter table public.studio_settings enable row level security;

drop policy if exists "settings readable by everyone" on public.studio_settings;
create policy "settings readable by everyone"
  on public.studio_settings for select using (true);

drop policy if exists "settings editable by staff" on public.studio_settings;
create policy "settings editable by staff"
  on public.studio_settings for update to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------
-- 2. DATE OVERRIDES — reuse the existing public.availability table.
--    A row exists ONLY when the admin explicitly overrides that date.
--    No row  ==  inherit the global defaults  ==  AVAILABLE.
-- ---------------------------------------------------------------------
alter table public.availability
  alter column max_bookings drop not null;

alter table public.availability
  alter column max_bookings drop default;

alter table public.studio_settings add column if not exists default_time_slots text[];
  alter table public.availability add column if not exists time_slots text[];

create unique index if not exists availability_date_key on public.availability (date);

grant select on public.availability to anon;
grant select, insert, update, delete on public.availability to authenticated;
grant all on public.availability to service_role;

alter table public.availability enable row level security;

drop policy if exists "availability readable by everyone" on public.availability;
create policy "availability readable by everyone"
  on public.availability for select using (true);

drop policy if exists "availability managed by staff" on public.availability;
create policy "availability managed by staff"
  on public.availability for all to authenticated
  using (true) with check (true);

-- Existing seeded rows that merely mirrored a default are not overrides.
-- (Keeps genuinely blocked dates, drops "3 bookings, available, no note" noise.)
delete from public.availability
 where available is true
   and coalesce(notes, '') = ''
   and max_bookings is null;

-- ---------------------------------------------------------------------
-- 3. WHICH BOOKINGS CONSUME CAPACITY
--    Cancelled bookings never consume capacity.
-- ---------------------------------------------------------------------
create or replace function public.booking_consumes_capacity(p_status text)
returns boolean language sql immutable as $$
  select coalesce(lower(p_status), 'pending') not in ('cancelled', 'canceled', 'declined', 'rejected')
$$;

-- ---------------------------------------------------------------------
-- 4. PUBLIC AVAILABILITY CALCULATION
--    Generates EVERY date in the window, then applies:
--      global default -> date override -> real booking count -> status
--    Exposes no client data.
-- ---------------------------------------------------------------------
create or replace function public.get_availability_calendar(
  p_start date default current_date,
  p_end   date default null
)
returns table (
  date          date,
  capacity      integer,
  booking_count integer,
  is_override   boolean,
  time_slots    text[],
  status        text
)
language sql
stable
security definer
set search_path = public
as $$
  with s as (
    select * from public.studio_settings where id = 1
  ),
  bounds as (
    select p_start as d0,
           coalesce(p_end, p_start + ((select booking_horizon_days from s) || ' days')::interval)::date as d1
  ),
  days as (
    select generate_series((select d0 from bounds), (select d1 from bounds), interval '1 day')::date as date
  ),
  counts as (
    select b.booking_date as date, count(*)::int as n
      from public.bookings b
     where public.booking_consumes_capacity(b.status::text)
     group by b.booking_date
  )
  select
    d.date,
    coalesce(a.max_bookings, (select default_max_bookings_per_day from s))::int as capacity,
    coalesce(c.n, 0)::int as booking_count,
    (a.date is not null) as is_override,
    coalesce(a.time_slots, (select default_time_slots from s)) as time_slots,
    case
      when d.date < current_date then 'past'
      when a.available is false then 'blocked'
      when coalesce(c.n, 0) >= coalesce(a.max_bookings, (select default_max_bookings_per_day from s)) then 'fully_booked'
      else 'available'
    end as status
  from days d
  left join public.availability a on a.date = d.date
  left join counts c on c.date = d.date
  order by d.date;
$$;

grant execute on function public.get_availability_calendar(date, date) to anon, authenticated, service_role;
grant execute on function public.booking_consumes_capacity(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- 5. NOTIFICATION TRACKING ON BOOKINGS
-- ---------------------------------------------------------------------
alter table public.bookings add column if not exists confirmation_email_sent_at timestamptz;
alter table public.bookings add column if not exists confirmation_email_status  text
  check (confirmation_email_status in ('pending', 'sent', 'failed'));

-- ---------------------------------------------------------------------
-- 6. NOTIFICATIONS TABLE (admin in-app notifications)
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid,
  booking_id  uuid references public.bookings(id) on delete cascade,
  type        text not null,
  title       text not null,
  message     text not null,
  is_read     boolean not null default false,
  metadata    jsonb
);

-- Idempotency: one notification per (booking, type).
create unique index if not exists notifications_booking_type_key
  on public.notifications (booking_id, type) where booking_id is not null;

create index if not exists notifications_created_at_idx
  on public.notifications (created_at desc);

grant select, insert, update on public.notifications to authenticated;
grant all on public.notifications to service_role;

alter table public.notifications enable row level security;

drop policy if exists "staff read notifications" on public.notifications;
create policy "staff read notifications"
  on public.notifications for select to authenticated using (true);

drop policy if exists "staff update notifications" on public.notifications;
create policy "staff update notifications"
  on public.notifications for update to authenticated
  using (true) with check (true);

drop policy if exists "staff insert notifications" on public.notifications;
create policy "staff insert notifications"
  on public.notifications for insert to authenticated with check (true);

-- ---------------------------------------------------------------------
-- 7. AUTO-CREATE AN ADMIN NOTIFICATION WHEN A BOOKING IS CREATED
--    Runs inside the existing booking insert; never blocks it.
-- ---------------------------------------------------------------------
create or replace function public.notify_admin_new_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client  record;
  v_service record;
begin
  select full_name, email, phone into v_client
    from public.clients where id = new.client_id;

  select name into v_service
    from public.services where id = new.service_id;

  insert into public.notifications (booking_id, type, title, message, metadata)
  values (
    new.id,
    'booking_created',
    'New Booking Request',
    coalesce(v_client.full_name, 'A client')
      || ' requested ' || coalesce(v_service.name, 'a session')
      || ' for ' || to_char(new.booking_date, 'FMMonth FMDD, YYYY')
      || coalesce(' at ' || to_char(new.booking_time, 'HH12:MI AM'), '')
      || '.',
    jsonb_build_object(
      'client_name',   v_client.full_name,
      'client_email',  v_client.email,
      'client_phone',  v_client.phone,
      'service_name',  v_service.name,
      'booking_date',  new.booking_date,
      'booking_time',  new.booking_time,
      'message',       new.message,
      'status',        new.status
    )
  )
  on conflict do nothing;

  return new;
exception when others then
  -- Notification problems must never fail the booking itself.
  return new;
end;
$$;

drop trigger if exists trg_notify_admin_new_booking on public.bookings;
create trigger trg_notify_admin_new_booking
  after insert on public.bookings
  for each row execute function public.notify_admin_new_booking();

-- ---------------------------------------------------------------------
-- 8. STATUS-CHANGE NOTIFICATIONS (confirmed / cancelled / completed)
-- ---------------------------------------------------------------------
create or replace function public.notify_admin_booking_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_name text;
  v_type text;
  v_title text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  v_type := 'booking_' || lower(new.status::text);
  v_title := case lower(new.status::text)
    when 'confirmed' then 'Booking Confirmed'
    when 'cancelled' then 'Booking Cancelled'
    when 'completed' then 'Shoot Completed'
    else 'Booking Updated'
  end;

  select full_name into v_client_name from public.clients where id = new.client_id;

  insert into public.notifications (booking_id, type, title, message, metadata)
  values (
    new.id, v_type, v_title,
    coalesce(v_client_name, 'A client') || ' — booking on '
      || to_char(new.booking_date, 'FMMonth FMDD, YYYY') || ' is now ' || lower(new.status::text) || '.',
    jsonb_build_object('client_name', v_client_name, 'status', new.status)
  )
  on conflict do nothing;

  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists trg_notify_admin_booking_status on public.bookings;
create trigger trg_notify_admin_booking_status
  after update of status on public.bookings
  for each row execute function public.notify_admin_booking_status();

-- ---------------------------------------------------------------------
-- 9. REALTIME
-- ---------------------------------------------------------------------
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.notifications';   exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.availability';     exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.studio_settings';  exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.bookings';         exception when others then null; end;
end $$;
