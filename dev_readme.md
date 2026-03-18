# Docs roadmap

### Introdution

To check how to implement something go to .tsx file that<br/>
has relation to what do you want to implement and in folder with this file read dev_readme.md<br/>
</br>
In docs I write how something work or how to implement something<br>

For example if you want upderstand how Project.tsx work go to directory `(site)/dev_readme.md`
and there you find info how Project.tsx work

### app/(site)

In this directory you find docs how work/implement something in site

### Supabase setup

```sql
create table public.bookings (
  id character varying not null,
  user_cookie_id character varying(255) not null,
  booking_date date not null,
  "booking_time_MSK" time without time zone not null,
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'GMT+3'::text),
  channel character varying not null,
  constraint bookings_pkey primary key (id)
) TABLESPACE pg_default;

-- no need RLS - I will use supabaseAdmin


-- =================================== 📋 cron_runs table (for CronSchedulesWidget) ===================================
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
    j.jobid                           AS id,
    COALESCE(m.created_at, NOW())     AS created_at,
    COALESCE(m.updated_at, NOW())     AS updated_at,
    cr.started_at                     AS last_run_at,
    cr.status                         AS last_run_status,
    COALESCE(m.total_runs, 0)         AS total_runs,
    j.jobname                         AS job_name,
    j.active                          AS is_active,
    j.command                         AS command,
    j.schedule                        AS schedule,
    m.description                     AS description
  FROM cron.job j
  LEFT JOIN public.cron_job_meta m
    ON m.job_name = j.jobname
  LEFT JOIN LATERAL (
    SELECT started_at, status
    FROM public.cron_runs
    WHERE job_name = j.jobname
      AND status IN ('success', 'failed')
    ORDER BY started_at DESC
    LIMIT 1
  ) cr ON true
  ORDER BY j.jobid
$$;

-- backfill meta for all jobs that already exist in cron.job
INSERT INTO public.cron_job_meta (job_id, job_name, created_at, updated_at, total_runs)
SELECT id, job_name, NOW(), NOW(), 0
FROM public.get_cron_schedules()
ON CONFLICT (job_id) DO NOTHING;




-- for CronSchedulesWidget
GRANT EXECUTE ON FUNCTION public.get_cron_schedules() TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_cron_job_meta(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_cron_job(bigint, text, text, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_cron_run(text, text) TO authenticated;
```
