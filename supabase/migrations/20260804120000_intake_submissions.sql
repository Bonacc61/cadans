-- Intake submissions from the cadans.ai homepage form.
--
-- The browser posts straight to PostgREST as the `anon` role. That role may
-- INSERT and nothing else: there is no SELECT/UPDATE/DELETE policy, and RLS
-- denies by default, so a leaked anon key cannot read anyone's leads.
--
-- Every constraint the old Pages Function enforced in JavaScript now lives
-- here instead, because the database is the only layer a direct POST to the
-- REST endpoint cannot bypass.

create table public.intake_submissions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  interest    text    not null,
  name        text    not null,
  email       text    not null,
  phone       text,
  company     text,
  message     text,

  -- Stored, not just checked: this row is the record that consent was given.
  consent     boolean not null,

  constraint intake_interest_valid
    check (interest in ('pa', 'webdev', 'geo', 'voice', 'automation', 'unknown')),

  -- An unconsented row is not insertable at all, at any layer.
  constraint intake_consent_given
    check (consent is true),

  constraint intake_name_len    check (char_length(name) between 1 and 100),
  constraint intake_email_len   check (char_length(email) between 3 and 200),
  constraint intake_email_shape
    check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'),
  constraint intake_phone_len   check (phone   is null or char_length(phone)   <= 40),
  constraint intake_company_len check (company is null or char_length(company) <= 120),
  constraint intake_message_len check (message is null or char_length(message) <= 4000)
);

comment on table public.intake_submissions is
  'Leads from the homepage intake form. Contains personal data (name, email, '
  'phone, free text). Retention: 12 months after creation, purged by '
  'purge_old_intake_submissions(). See landing/privacy/index.html.';

alter table public.intake_submissions enable row level security;

-- Visitors may file a lead. They may never read one back.
create policy "anon can submit an intake request"
  on public.intake_submissions
  for insert
  to anon
  with check (true);

-- "Automatically expose new tables" is off, so privileges are granted by hand.
-- INSERT only, and no column-level SELECT, so PostgREST cannot return the row.
grant usage on schema public to anon;
grant insert on public.intake_submissions to anon;

-- Supports the retention purge's age scan and newest-first browsing in the
-- dashboard. Not load-bearing at this table's expected size.
create index intake_submissions_created_at_idx
  on public.intake_submissions (created_at desc);
