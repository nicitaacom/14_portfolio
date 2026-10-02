## Appointment availability — preflight, migration, and verification

Run the preflight first on the intended Supabase project. It is read-only. The migration holds a short write lock on `bookings` while it backfills the shared occupancy table and installs the database guard. It refuses duplicate booking instants instead of changing or deleting appointments. Historical off-grid rows are retained and claimed; only new or moved rows must use the current grid.

The same complete migration below is the appointment schema section for a fresh setup. Keep it with this document so neither an upgrade nor a new project omits the occupancy trigger and admin RPC.

### Read-only schema and data preflight

```sql
SELECT version();

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bookings'
ORDER BY ordinal_position;

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.bookings'::regclass
ORDER BY conname;

SELECT tgname, pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgrelid = 'public.bookings'::regclass AND NOT tgisinternal
ORDER BY tgname;

SELECT c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
FROM pg_class c WHERE c.oid = 'public.bookings'::regclass;

SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'bookings'
ORDER BY grantee, privilege_type;

-- Duplicate starts must be resolved by the data owner before the migration.
SELECT booking_date, "booking_time_MSK", array_agg(id ORDER BY id) AS booking_ids, count(*) AS row_count
FROM public.bookings
GROUP BY booking_date, "booking_time_MSK"
HAVING count(*) > 1
ORDER BY booking_date, "booking_time_MSK";

-- Historical off-grid rows are reported and preserved by the migration.
SELECT id, booking_date, "booking_time_MSK"
FROM public.bookings
WHERE "booking_time_MSK" < time '12:00'
   OR "booking_time_MSK" > time '22:00'
   OR extract(minute FROM "booking_time_MSK")::integer % 30 <> 0
   OR extract(second FROM "booking_time_MSK") <> 0
ORDER BY booking_date, "booking_time_MSK", id;

-- Inspect the exact arbitrary-SQL function grant and identify shared consumers before revocation.
SELECT p.oid::regprocedure AS function_name, p.prosecdef AS security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_can_execute,
       has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_can_execute
FROM pg_proc p
WHERE p.oid = to_regprocedure('public.execute_any_sql(text)');

SELECT p.oid::regprocedure AS function_name, r.rolname AS grantee, a.privilege_type
FROM pg_proc p
CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
JOIN pg_roles r ON r.oid = a.grantee
WHERE p.oid = to_regprocedure('public.execute_any_sql(text)')
ORDER BY r.rolname;
```

If duplicate instants are returned, stop before migration and resolve them with the owner. Check every `execute_any_sql` caller across projects before revoking the authenticated grant: the function can mutate the shared database, so leaving it available defeats the admin block boundary; revoking it may affect another project's caller.

### Runnable migration

Run this whole block in one SQL session. It is additive and safe to rerun after a successful run. It does not remove bookings or blocks.

```sql
BEGIN;

LOCK TABLE public.bookings IN SHARE ROW EXCLUSIVE MODE;

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS contact text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS contact_type text;

DO $$
DECLARE duplicate_ids text;
BEGIN
  SELECT string_agg(id, ', ' ORDER BY id) INTO duplicate_ids
  FROM (
    SELECT unnest(array_agg(id)) AS id
    FROM public.bookings
    GROUP BY booking_date, "booking_time_MSK"
    HAVING count(*) > 1
  ) duplicates;
  IF duplicate_ids IS NOT NULL THEN
    RAISE EXCEPTION 'Appointment occupancy migration stopped: duplicate booking starts exist for IDs %', duplicate_ids;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.appointment_slot_occupancy (
  starts_at timestamptz PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('booked', 'blocked')),
  booking_id varchar UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  blocked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointment_slot_occupancy_shape_check CHECK (
    (kind = 'booked' AND booking_id IS NOT NULL AND blocked_by IS NULL)
    OR (kind = 'blocked' AND booking_id IS NULL AND blocked_by IS NOT NULL)
  )
);

-- Serialize the reconciliation/backfill with concurrent admin block mutations.
LOCK TABLE public.appointment_slot_occupancy IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.appointment_slot_occupancy'::regclass AND conname = 'appointment_slot_occupancy_booking_id_key') THEN
    ALTER TABLE public.appointment_slot_occupancy ADD CONSTRAINT appointment_slot_occupancy_booking_id_key UNIQUE (booking_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.appointment_slot_occupancy'::regclass AND conname = 'appointment_slot_occupancy_booking_id_fkey') THEN
    ALTER TABLE public.appointment_slot_occupancy ADD CONSTRAINT appointment_slot_occupancy_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.appointment_slot_occupancy'::regclass AND conname = 'appointment_slot_occupancy_shape_check') THEN
    ALTER TABLE public.appointment_slot_occupancy ADD CONSTRAINT appointment_slot_occupancy_shape_check CHECK (
      (kind = 'booked' AND booking_id IS NOT NULL AND blocked_by IS NULL)
      OR (kind = 'blocked' AND booking_id IS NULL AND blocked_by IS NOT NULL)
    );
  END IF;
END;
$$;

DO $$
DECLARE conflicting_ids text;
BEGIN
  SELECT string_agg(b.id, ', ' ORDER BY b.id) INTO conflicting_ids
  FROM public.bookings b
  JOIN public.appointment_slot_occupancy o
    ON o.starts_at = ((b.booking_date + b."booking_time_MSK") AT TIME ZONE 'Europe/Moscow')
  WHERE o.kind <> 'booked' OR o.booking_id IS DISTINCT FROM b.id;
  IF conflicting_ids IS NOT NULL THEN
    RAISE EXCEPTION 'Appointment occupancy migration stopped: existing blocks or claims conflict with booking IDs %', conflicting_ids;
  END IF;
END;
$$;

-- Preserve every historical booking, including validly stored off-grid times.
INSERT INTO public.appointment_slot_occupancy (starts_at, kind, booking_id, blocked_by)
SELECT (booking_date + "booking_time_MSK") AT TIME ZONE 'Europe/Moscow', 'booked', id, NULL
FROM public.bookings
ON CONFLICT (starts_at) DO NOTHING;

CREATE OR REPLACE FUNCTION public.guard_appointment_booking_slot()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_starts_at timestamptz;
  v_hour integer;
  v_minute integer;
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.booking_date IS NOT DISTINCT FROM NEW.booking_date
     AND OLD."booking_time_MSK" IS NOT DISTINCT FROM NEW."booking_time_MSK" THEN
    RETURN NEW;
  END IF;

  v_hour := extract(hour FROM NEW."booking_time_MSK")::integer;
  v_minute := extract(minute FROM NEW."booking_time_MSK")::integer;
  IF v_hour < 12 OR v_hour > 22 OR (v_hour = 22 AND v_minute > 0) OR v_minute % 30 <> 0
     OR extract(second FROM NEW."booking_time_MSK") <> 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'APPT_SLOT_INVALID';
  END IF;

  v_starts_at := (NEW.booking_date + NEW."booking_time_MSK") AT TIME ZONE 'Europe/Moscow';
  IF v_starts_at < clock_timestamp() + interval '30 minutes' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'APPT_SLOT_TOO_SOON';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    DELETE FROM public.appointment_slot_occupancy
    WHERE kind = 'booked' AND booking_id = OLD.id;
  END IF;

  BEGIN
    INSERT INTO public.appointment_slot_occupancy (starts_at, kind, booking_id, blocked_by)
    VALUES (v_starts_at, 'booked', NEW.id, NULL);
  EXCEPTION WHEN unique_violation THEN
    IF EXISTS (SELECT 1 FROM public.appointment_slot_occupancy WHERE starts_at = v_starts_at) THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'APPT_SLOT_OCCUPIED';
    END IF;
    RAISE;
  END;

  -- clock_timestamp() advances while a unique-key wait is in progress.
  IF v_starts_at < clock_timestamp() + interval '30 minutes' THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'APPT_SLOT_TOO_SOON';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_guard_appointment_slot ON public.bookings;
CREATE TRIGGER bookings_guard_appointment_slot
AFTER INSERT OR UPDATE OF booking_date, "booking_time_MSK" ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.guard_appointment_booking_slot();

CREATE OR REPLACE FUNCTION public.set_appointment_blocks(
  p_starts_at timestamptz[],
  p_blocked boolean,
  p_actor_id uuid
)
RETURNS TABLE(changed integer, unchanged integer)
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_start timestamptz;
  v_local timestamp without time zone;
  v_hour integer;
  v_minute integer;
  v_kind text;
BEGIN
  IF p_starts_at IS NULL OR cardinality(p_starts_at) < 1 OR cardinality(p_starts_at) > 64
     OR p_blocked IS NULL OR p_actor_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'APPT_SLOT_INVALID';
  END IF;

  changed := 0;
  unchanged := 0;
  FOR v_start IN SELECT DISTINCT slot FROM unnest(p_starts_at) AS input(slot) ORDER BY slot
  LOOP
    v_local := v_start AT TIME ZONE 'Europe/Moscow';
    v_hour := extract(hour FROM v_local)::integer;
    v_minute := extract(minute FROM v_local)::integer;
    IF v_start IS NULL OR v_hour < 12 OR v_hour > 22 OR (v_hour = 22 AND v_minute > 0) OR v_minute % 30 <> 0
       OR extract(second FROM v_local) <> 0 THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'APPT_SLOT_INVALID';
    END IF;
    IF v_start <= clock_timestamp() THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'APPT_SLOT_PAST';
    END IF;

    IF p_blocked THEN
      BEGIN
        INSERT INTO public.appointment_slot_occupancy (starts_at, kind, booking_id, blocked_by)
        VALUES (v_start, 'blocked', NULL, p_actor_id);
        changed := changed + 1;
      EXCEPTION WHEN unique_violation THEN
        SELECT kind INTO v_kind FROM public.appointment_slot_occupancy WHERE starts_at = v_start;
        IF v_kind = 'blocked' THEN
          unchanged := unchanged + 1;
        ELSE
          RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'APPT_SLOT_BOOKED';
        END IF;
      END;
    ELSE
      DELETE FROM public.appointment_slot_occupancy
      WHERE starts_at = v_start AND kind = 'blocked';
      IF FOUND THEN changed := changed + 1; ELSE unchanged := unchanged + 1; END IF;
    END IF;
  END LOOP;
  RETURN NEXT;
END;
$$;

ALTER TABLE public.appointment_slot_occupancy ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.appointment_slot_occupancy FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.appointment_slot_occupancy TO service_role;
REVOKE EXECUTE ON FUNCTION public.set_appointment_blocks(timestamptz[], boolean, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_appointment_blocks(timestamptz[], boolean, uuid) TO service_role;

-- This exact function can execute arbitrary SQL. Revoke its exposed authenticated path after
-- checking the preflight consumer inventory; keep only the existing service-role application path.
DO $$
BEGIN
  IF to_regprocedure('public.execute_any_sql(text)') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.execute_any_sql(text) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.execute_any_sql(text) TO service_role';
  END IF;
END;
$$;

COMMIT;
```

### Post-migration verification

```sql
-- Each booking has exactly one matching booked occupancy record.
SELECT b.id, b.booking_date, b."booking_time_MSK"
FROM public.bookings b
LEFT JOIN public.appointment_slot_occupancy o
  ON o.booking_id = b.id
 AND o.starts_at = ((b.booking_date + b."booking_time_MSK") AT TIME ZONE 'Europe/Moscow')
 AND o.kind = 'booked'
WHERE o.booking_id IS NULL;

-- No orphan booked claims, and admin blocks remain distinguishable.
SELECT o.*
FROM public.appointment_slot_occupancy o
LEFT JOIN public.bookings b ON b.id = o.booking_id
WHERE (o.kind = 'booked' AND b.id IS NULL)
   OR (o.kind = 'blocked' AND o.booking_id IS NOT NULL);

SELECT kind, count(*) FROM public.appointment_slot_occupancy GROUP BY kind ORDER BY kind;

SELECT tgname, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE tgrelid = 'public.bookings'::regclass AND tgname = 'bookings_guard_appointment_slot';

SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name = 'appointment_slot_occupancy'
ORDER BY grantee, privilege_type;

SELECT has_function_privilege('anon', 'public.set_appointment_blocks(timestamptz[],boolean,uuid)', 'EXECUTE') AS anon_can_block,
       has_function_privilege('authenticated', 'public.set_appointment_blocks(timestamptz[],boolean,uuid)', 'EXECUTE') AS authenticated_can_block,
       has_function_privilege('service_role', 'public.set_appointment_blocks(timestamptz[],boolean,uuid)', 'EXECUTE') AS service_role_can_block;
```

The rollback for an application defect is an application rollback while keeping this occupancy table, existing block rows, and booking trigger installed. Keep admin blocking disabled in the reverted app if its endpoint is incompatible. Do not drop the table or trigger while the old booking writer is active. If a later database correction is necessary, issue a forward migration after resolving the preflight evidence.

## Shared UTM table

```sql

-- =================================== 📈 utm_stats table (SHARED across 14, 23, 28, 29) ===================================
-- Unified UTM tracking across all portfolio projects
-- ⚠️ SHARED TABLE: Projects 14_portfolio, 23_store, 28_notion-clone, 29_ai-companion use this same utm_stats table
-- All UTM tracking data is aggregated in a single shared Supabase table


CREATE TABLE IF NOT EXISTS public.utm_stats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id     TEXT NOT NULL,
  source      TEXT,
  medium      TEXT,
  campaign    TEXT,
  url         TEXT,
  user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS idx_utm_stats_created_at ON public.utm_stats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_utm_stats_user_id    ON public.utm_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_utm_stats_source     ON public.utm_stats(source);
CREATE INDEX IF NOT EXISTS idx_utm_stats_campaign   ON public.utm_stats(campaign);

-- 🔐 RLS Policies
ALTER TABLE public.utm_stats ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'utm_stats' AND policyname = 'Allow select for everyone') THEN
        CREATE POLICY "Allow select for everyone" ON public.utm_stats FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'utm_stats' AND policyname = 'Allow insert for everyone') THEN
        CREATE POLICY "Allow insert for everyone" ON public.utm_stats FOR INSERT WITH CHECK (true);
    END IF;
END
$$;

ALTER TABLE public.utm_stats FORCE ROW LEVEL SECURITY;

```

## Supabase setup (1 shared DB for 19,23,28,29)

> The reason for that is auth - Supabase disable inactive projects - so all my portfolio projects stays in "working" state

> ⚠️ One caveat to this is 26 hot-delivery - this is separated mid-size project with it's own ecosystem - too big to list here

```sql

-- =================================== PROJECT TABLES (19, 23, 28, 29) ===================================

-- =================================== PROJECT 19: SPOTIFY CLONE (DRY - 1 source of truth)  https://github.com/nicitaacom/19_spotify-clone/blob/production/dev_readme.md ===================================

-- =================================== PROJECT 23 STORE (JOKIK) - (DRY - 1 source of truth)  https://github.com/nicitaacom/23_store/blob/development/dev_readme-supbase-sql.md ===================================

-- =================================== PROJECT 28 JOTION (JOKIK ecosystem) ===================================
-- Note: 28_notion-clone uses Convex backend for data persistence, not Supabase tables

-- 📊 utm_stats table (shared with other projects)
-- See shared utm_stats definition in main Supabase setup section

-- =================================== PROJECT 29 JOMPANION (JOKIK ecosystem) - (DRY - 1 source of truth)  https://github.com/nicitaacom/29_jompanion/blob/development/dev_readme-supabase-sql.md ===================================

```

## Supabase setup (14 - for this project ONLY)

```sql
-- 🔥 Allow running arbitrary SQL (careful with SECURITY DEFINER!)
CREATE OR REPLACE FUNCTION execute_any_sql(query TEXT) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN EXECUTE query; END $$;

-- ✅ Grant execution to authenticated users if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_roles
    WHERE rolname = 'authenticated'
    AND has_function_privilege('execute_any_sql(TEXT)', 'EXECUTE')
  ) THEN GRANT EXECUTE ON FUNCTION execute_any_sql(TEXT) TO authenticated;
  END IF;
END $$;


create table public.bookings (
  id character varying not null,
  user_cookie_id character varying(255) not null,
  booking_date date not null,
  "booking_time_MSK" time without time zone not null,
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'GMT+3'::text),
  channel character varying not null,
  constraint bookings_pkey primary key (id)
) TABLESPACE pg_default;

alter table public.bookings enable row level security;

-- no policies needed here because all reads/writes for bookings go through
-- supabaseAdmin with the service role key, which bypasses RLS.



-- ===================================  cron_runs table (for CronSchedulesWidget) ===================================
-- one row per execution, status updated in-place by log_cron_run

CREATE TABLE IF NOT EXISTS public.cron_runs (
  id          SERIAL PRIMARY KEY,
  job_name    TEXT NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status      TEXT CHECK (status IN ('running', 'success', 'failed')),
  error       TEXT
);

CREATE INDEX IF NOT EXISTS idx_cron_runs_job_name   ON public.cron_runs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_runs_started_at ON public.cron_runs(started_at DESC);

-- 🔐 RLS Policies
ALTER TABLE public.cron_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cron_runs' AND policyname = 'Allow select for everyone') THEN
        CREATE POLICY "Allow select for everyone" ON public.cron_runs FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cron_runs' AND policyname = 'Allow insert for everyone') THEN
        CREATE POLICY "Allow insert for everyone" ON public.cron_runs FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cron_runs' AND policyname = 'Allow update for everyone') THEN
        CREATE POLICY "Allow update for everyone" ON public.cron_runs FOR UPDATE USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cron_runs' AND policyname = 'Allow delete for everyone') THEN
        CREATE POLICY "Allow delete for everyone" ON public.cron_runs FOR DELETE USING (true);
    END IF;
END
$$;

ALTER TABLE public.cron_runs FORCE ROW LEVEL SECURITY;

-- =================================== 📋 cron_job_meta table ===================================
-- tracks created_at, updated_at, total_runs per job
-- total_runs incremented here (not counted live) for fast dashboard reads

CREATE TABLE IF NOT EXISTS public.cron_job_meta (
  job_id      BIGINT PRIMARY KEY,
  job_name    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT DEFAULT NULL,
  total_runs  INT NOT NULL DEFAULT 0
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cron_job_meta_job_name_unique'
  ) THEN
    ALTER TABLE public.cron_job_meta ADD CONSTRAINT cron_job_meta_job_name_unique UNIQUE (job_name);
  END IF;
END
$$;
-- 🔐 RLS Policies
ALTER TABLE public.cron_job_meta ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cron_job_meta' AND policyname = 'Allow select for everyone') THEN
        CREATE POLICY "Allow select for everyone" ON public.cron_job_meta FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cron_job_meta' AND policyname = 'Allow insert for everyone') THEN
        CREATE POLICY "Allow insert for everyone" ON public.cron_job_meta FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cron_job_meta' AND policyname = 'Allow update for everyone') THEN
        CREATE POLICY "Allow update for everyone" ON public.cron_job_meta FOR UPDATE USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cron_job_meta' AND policyname = 'Allow delete for everyone') THEN
        CREATE POLICY "Allow delete for everyone" ON public.cron_job_meta FOR DELETE USING (true);
    END IF;
END
$$;

ALTER TABLE public.cron_job_meta FORCE ROW LEVEL SECURITY;

-- =================================== 🔧 upsert_cron_job_meta ===================================
-- call once per job when scheduling - sets created_at on first insert, updated_at on re-schedule
CREATE OR REPLACE FUNCTION public.upsert_cron_job_meta(p_job_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_job_id BIGINT;
BEGIN
  SELECT id INTO v_job_id
  FROM public.get_cron_schedules()
  WHERE job_name = p_job_name
  LIMIT 1;

  IF v_job_id IS NULL THEN RETURN; END IF;

  -- 1. update existing row if job_name already exists
  UPDATE public.cron_job_meta
  SET job_id = v_job_id, updated_at = NOW()
  WHERE job_name = p_job_name;

  -- 2. insert only if no row was updated
  IF NOT FOUND THEN
    INSERT INTO public.cron_job_meta (job_id, job_name, created_at, updated_at, total_runs)
    VALUES (v_job_id, p_job_name, NOW(), NOW(), 0)
    ON CONFLICT (job_id) DO UPDATE SET updated_at = NOW();
  END IF;
END;
$$;




-- =================================== 🔧 update_cron_job ===================================

CREATE OR REPLACE FUNCTION public.update_cron_job(
  p_jobid       BIGINT,
  p_jobname     TEXT,
  p_schedule    TEXT,
  p_command     TEXT,
  p_active      BOOLEAN,
  p_description TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
BEGIN
  PERFORM cron.alter_job(
    job_id   => p_jobid,
    schedule => p_schedule,
    command  => p_command,
    active   => p_active
  );

  -- 1. match on job_id — reliable, not affected by cron.job visibility
  UPDATE public.cron_job_meta
  SET description = p_description, updated_at = NOW()
  WHERE job_id = p_jobid;
END;
$$;




-- =================================== 🔧 log_cron_run wrapper ===================================
-- wraps any job SQL - inserts cron_runs row, updates status, increments meta counter

CREATE OR REPLACE FUNCTION public.log_cron_run(p_job_name TEXT, p_sql TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_run_id INTEGER;
BEGIN
  -- 1. open run row
  INSERT INTO public.cron_runs (job_name, started_at, status)
  VALUES (p_job_name, NOW(), 'running')
  RETURNING id INTO v_run_id;

  BEGIN
    -- 2. execute job
    EXECUTE p_sql;

    -- 3. success path
    UPDATE public.cron_runs
    SET status = 'success', finished_at = NOW()
    WHERE id = v_run_id;

    UPDATE public.cron_job_meta
    SET total_runs = total_runs + 1, updated_at = NOW()
    WHERE job_name = p_job_name;

  EXCEPTION WHEN OTHERS THEN
    -- 4. failure path - still increment (it ran, it failed)
    UPDATE public.cron_runs
    SET status = 'failed', finished_at = NOW(), error = SQLERRM
    WHERE id = v_run_id;

    UPDATE public.cron_job_meta
    SET total_runs = total_runs + 1, updated_at = NOW()
    WHERE job_name = p_job_name;
  END;
END;
$$;


-- =================================== 5️⃣ get_cron_schedules RPC ===================================

DROP FUNCTION IF EXISTS public.get_cron_schedules();

CREATE OR REPLACE FUNCTION public.get_cron_schedules()
RETURNS TABLE(
  id              BIGINT,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ,
  last_run_at     TIMESTAMPTZ,
  last_run_status TEXT,
  total_runs      INT,
  job_name        TEXT,
  is_active       BOOLEAN,
  command         TEXT,
  schedule        TEXT,
  description     TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, cron, extensions
AS $$
  SELECT
    NULL::BIGINT                     AS id,
    NOW()                            AS created_at,
    NOW()                            AS updated_at,
    NULL::TIMESTAMPTZ                AS last_run_at,
    NULL::TEXT                       AS last_run_status,
    0                                AS total_runs,
    NULL::TEXT                       AS job_name,
    NULL::BOOLEAN                    AS is_active,
    NULL::TEXT                       AS command,
    NULL::TEXT                       AS schedule,
    NULL::TEXT                       AS description
  WHERE false
$$;
-- backfill meta for all jobs that already exist in cron.job
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'cron' AND tablename = 'job') THEN
    INSERT INTO public.cron_job_meta (job_id, job_name, created_at, updated_at, total_runs)
    SELECT id, job_name, NOW(), NOW(), 0
    FROM public.get_cron_schedules()
    ON CONFLICT (job_id) DO NOTHING;
  END IF;
END $$;



-- for CronSchedulesWidget
GRANT EXECUTE ON FUNCTION public.get_cron_schedules() TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_cron_job_meta(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_cron_job(bigint, text, text, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_cron_run(text, text) TO authenticated;


```

## Edge functions

### 1. Function name: sendTgNtfcnAppointment

```ts
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { Resend } from "npm:resend"

interface TriggerPayload {
  notificationId?: string
}

async function readPayload(req: Request) {
  try {
    return (await req.json()) as TriggerPayload
  } catch {
    return {}
  }
}

async function sendErrorEmail(params: {
  resendSecret: string
  errEmailsSendTo: string
  notificationId?: string
  stage: string
  error: string
  extra?: string
}) {
  const resend = new Resend(params.resendSecret)

  await resend.emails.send({
    from: "errors@resend.dev",
    to: params.errEmailsSendTo,
    subject: `[14_portfolio] Telegram reminder failed: ${params.stage}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
        <h2 style="margin-bottom: 12px;">Telegram reminder failure</h2>
        <p><strong>Stage:</strong> ${params.stage}</p>
        <p><strong>Notification ID:</strong> ${params.notificationId ?? "missing"}</p>
        <p><strong>Error:</strong></p>
        <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 8px;">${params.error}</pre>
        ${
          params.extra
            ? `<p><strong>Extra:</strong></p><pre style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 8px;">${params.extra}</pre>`
            : ""
        }
      </div>
    `,
  })
}

console.info("sendTgNtfcnAppointment edge function started")

Deno.serve(async req => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL")
  const supabaseServiceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")
  const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN")
  const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID")
  const resendSecret = Deno.env.get("RESEND_SECRET")
  const errEmailsSendTo = Deno.env.get("ERR_EMAILS_SEND_TO")

  if (
    !supabaseUrl ||
    !supabaseServiceRoleKey ||
    !telegramBotToken ||
    !telegramChatId ||
    !resendSecret ||
    !errEmailsSendTo
  ) {
    return new Response(
      JSON.stringify({
        error:
          "Missing one of NEXT_PUBLIC_SUPABASE_URL, SERVICE_ROLE_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, RESEND_SECRET, ERR_EMAILS_SEND_TO.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  const payload = await readPayload(req)
  if (!payload.notificationId) {
    return new Response(
      JSON.stringify({
        error: "Missing notificationId.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  const cronJobName = `telegram_notification_${payload.notificationId}`

  const { data: notification, error } = await supabase
    .from("telegram_notifications")
    .select("id, message")
    .eq("id", payload.notificationId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`

  const telegramResponse = await fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: telegramChatId,
      text: notification.message,
      parse_mode: "HTML",
    }),
  })

  if (!telegramResponse.ok) {
    const telegramError = await telegramResponse.text()
    await sendErrorEmail({
      resendSecret,
      errEmailsSendTo,
      notificationId: payload.notificationId,
      stage: "telegram send",
      error: telegramError,
      extra: notification.message,
    })

    return new Response(JSON.stringify({ error: telegramError }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { error: deleteError } = await supabase.from("telegram_notifications").delete().eq("id", payload.notificationId)
  if (deleteError) {
    await sendErrorEmail({
      resendSecret,
      errEmailsSendTo,
      notificationId: payload.notificationId,
      stage: "delete telegram_notifications row",
      error: deleteError.message,
    })

    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const unscheduleQuery = `
    DO $$
    BEGIN
      PERFORM cron.unschedule('${cronJobName}');
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END $$;
  `

  const { error: unscheduleError } = await supabase.rpc("execute_any_sql", { query: unscheduleQuery })
  if (unscheduleError) {
    console.error("Error unscheduling telegram notification:", unscheduleError)
    await sendErrorEmail({
      resendSecret,
      errEmailsSendTo,
      notificationId: payload.notificationId,
      stage: "cron.unschedule",
      error: unscheduleError.message,
      extra: unscheduleQuery,
    })
  }

  return new Response(
    JSON.stringify({
      ok: true,
      notificationId: payload.notificationId,
    }),
    { headers: { "Content-Type": "application/json" } },
  )
})
```

**Secrets the function reads** — Edge Functions → **Secrets**, all six have to exist:

| Name                       | Used for                                                           |
| -------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL` | the client that reads and deletes the notification row             |
| `SERVICE_ROLE_KEY`         | same client — note the name has no `SUPABASE_` in front of it here |
| `TELEGRAM_BOT_TOKEN`       | the send                                                           |
| `TELEGRAM_CHAT_ID`         | the send                                                           |
| `RESEND_SECRET`            | the failure email                                                  |
| `ERR_EMAILS_SEND_TO`       | where that email goes                                              |

- One missing name and every run answers 500 with `Missing one of ...` before it sends anything.
- Edge Functions → **Logs** shows `sendTgNtfcnAppointment edge function started` on the first run
  after a deploy — that line is the fastest check that the new version is the one being invoked.

### 3. Check it worked

```sql
-- the schedule the booking created. Run right after booking.
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname LIKE 'telegram_notification_%';

-- the pending reminder rows
SELECT id, booking_id, scheduled_for, message FROM telegram_notifications ORDER BY scheduled_for DESC LIMIT 5;

-- when pg_cron fired the job and whether the SQL itself succeeded
SELECT status, return_message, start_time FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- which timezone pg_cron reads those schedule numbers in
SELECT current_setting('cron.timezone', true) AS cron_timezone, current_setting('TimeZone') AS db_timezone, now();
```

| Answer                                             | Meaning                                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| `schedule` = `50 14 3 8 *`                         | correct — 5th field is `*`, 3rd field is the appointment day                      |
| `schedule` ends in a digit                         | the day-of-week bug is back — cron reads day-number OR weekday, so it fires early |
| `scheduled_for` = booking time minus 10 min        | the row the edge function reads                                                   |
| after the send: 0 rows in `cron.job`               | the schedule deleted itself                                                       |
| after the send: 0 rows in `telegram_notifications` | the row deleted itself                                                            |
| `cron_timezone` = `Europe/Moscow`                  | fires at the intended minute                                                      |
| `cron_timezone` = `UTC`                            | fires 3 hours late — the schedule numbers are Moscow local                        |

### 4. Run it now instead of waiting

The same request pg_cron sends. One click sends the message and deletes the schedule, so both fixes
show at once.

1. Edge Functions → `sendTgNtfcnAppointment` → **Test**.
2. Method **POST**, body:

```json
{ "notificationId": "PASTE_AN_ID_FROM_SECTION_3" }
```

3. **Send request**.

- `{"ok":true,...}` comes back and the Telegram message arrives.
- Both queries in 3 then give 0 rows, and no failure email arrives. Before the fix one arrived after
  every successful send.
- A 401 means the panel sent the anon key: put the service role key in the `Authorization` header as
  `Bearer <key>`, which is what the cron body sends.

### 5. Decided against — the supabase CLI

- `pnpm dlx supabase@latest functions deploy sendTgNtfcnAppointment --project-ref bvvhwcmjlbofleanshdm`
  works with nothing installed globally, and it was tried on 2026-08-03.
- It wants a login token and a second copy of the function on disk to read from.
- Nikita's call: this function is deployed from the dashboard, and this doc stays the only copy.

<br/>

## Keys check cron

### 0. Why this exists

A third party revokes an API key and nothing tells you. `.githooks/pre-push` catches it locally every
3 days, but this project goes weeks without a push, and Vercel holds a separate copy of every variable
anyway. This cron is what checks **prod**.

Full write-up: [app/api/webhooks/check-envs/dev_readme-check-env.md](./app/api/webhooks/check-envs/dev_readme-check-env.md).

### 1. What it does

```
pg_cron 'keys_check'  '0 5 * * *'   (fires daily, the const in code decides)
  │
  └─ pg_net → POST https://<prod domain>/api/webhooks/check-envs
                Authorization: Bearer <CRON_SECRET from the Vault>
                │
                └─ app/api/webhooks/check-envs/route.ts
                     ├─ last run newer than PROD_CHECK_EVERY_DAYS? → 200 {"skipped":true}
                     └─ otherwise run all 14 probes, then on a failure:
                          a Telegram message, and an email only if Telegram did not land
```

**The schedule is daily on purpose.** `PROD_CHECK_EVERY_DAYS` in `app/utils/checkKeys.ts` is the real
gate, so moving from weekly to daily later is changing `7` to `1` in one TypeScript file — no SQL edit
and no chance of the cron and the code disagreeing about the cadence.

05:00 UTC, an hour after `23_store`'s job, so the two never send at once.

### 2. Run this once

This project has **its own Supabase project** (`bvvhwcmjlbofleanshdm`), so run this there, not in the
shared 19/23/28/29 database. Replace both placeholders first. `keys_webhook_secret` must equal
`CRON_SECRET` in Vercel exactly, or every run answers 401.

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS supabase_vault CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'keys_webhook_base_url') THEN
    PERFORM vault.create_secret('https://YOUR_PRODUCTION_DOMAIN', 'keys_webhook_base_url');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'keys_webhook_secret') THEN
    PERFORM vault.create_secret('REPLACE_WITH_THE_SAME_VALUE_AS_CRON_SECRET', 'keys_webhook_secret');
  END IF;
END;
$$;

SELECT cron.unschedule('keys_check')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'keys_check');

SELECT cron.schedule('keys_check', '0 5 * * *', $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'keys_webhook_base_url')
           || '/api/webhooks/check-envs',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'keys_webhook_secret'),
      'Content-Type',
      'application/json'
    ),
    body := '{}'::JSONB,
    timeout_milliseconds := 60000
  );
$$);
```

### 3. Check it worked

```sql
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'keys_check';

SELECT status, content, created FROM net._http_response ORDER BY created DESC LIMIT 5;

SELECT status, return_message, start_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'keys_check')
ORDER BY start_time DESC
LIMIT 5;
```

Or skip the wait and send the request yourself:

```bash
curl -s -X POST https://YOUR_PRODUCTION_DOMAIN/api/webhooks/check-envs \
  -H "Authorization: Bearer YOUR_CRON_SECRET" | jq
```

| Answer                                                             | Meaning                                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------- |
| `{"ok":true,"checked":14}`                                         | every name is good                                          |
| `{"skipped":true,"daysSinceLastRun":0}`                            | already ran inside `PROD_CHECK_EVERY_DAYS` — the gate works |
| `{"ok":false,...,"alerted":true,"telegramSent":true}`              | the Telegram message went out, no email sent                |
| `{"ok":false,...,"alerted":true,"emailSent":true}`                 | Telegram did not land, so the email went instead            |
| `{"ok":false,"alerted":false,"reason":"same names as last alert"}` | quiet on purpose, nothing new                               |
| `{"error":"Unauthorized"}`                                         | the Vault secret and `CRON_SECRET` in Vercel differ         |
| `{"error":"CRON_SECRET is not configured"}`                        | the variable is missing from Vercel Production              |

### 4. Where the state lives

Not in Postgres — in Upstash, so there is no table and no `types_db.ts` edit:

```
keys-check:14:last-run     ISO timestamp   the PROD_CHECK_EVERY_DAYS gate reads this
keys-check:14:last-report  the report      the last answer, readable without a run
keys-check:14:last-alert   names + sentAt  what was already reported, so it stays quiet
```

`14` is in every key because projects 14/19/23/28/29 share one Upstash database. See
`app/libs/keysCheckRedis.ts`.
