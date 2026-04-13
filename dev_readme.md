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

-- no need RLS - I will use supabaseAdmin


-- =================================== 📈 utm_stats table (SHARED across 14, 23, 28, 29) ===================================
-- Unified UTM tracking across all portfolio projects

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

-- ⚠️ SHARED TABLE: Projects 14_portfolio, 23_store, 28_notion-clone, 29_ai-companion use this same utm_stats table
-- All UTM tracking data is aggregated in a single shared Supabase table


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


-- =================================== PROJECT TABLES (19, 23, 28, 29) ===================================

-- 🎯 CREATE CUSTOM ENUM TYPES (MUST EXIST BEFORE TABLES)
DO $$
BEGIN
    CREATE TYPE public.pricing_type AS ENUM ('one_time', 'recurring');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.playlist_visibility AS ENUM ('public', 'unlisted', 'private');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =================================== PROJECT 19: SPOTIFY CLONE ===================================
-- 📦 TABLE: products_19 (STRIPE PRODUCTS) - FIXED: renamed from 19_products
CREATE TABLE public.products_19 (
    id TEXT NOT NULL,
    active BOOLEAN NULL,
    name TEXT NULL,
    description TEXT NULL,
    image TEXT NULL,
    metadata JSONB NULL,
    CONSTRAINT products_19_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR products_19
ALTER TABLE public.products_19 ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products_19' AND policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access"
        ON public.products_19 FOR SELECT USING (true);
    END IF;
END $$;

-- 📦 TABLE: prices_19 (DEPENDS ON products_19) - FIXED: renamed from 19_prices
CREATE TABLE public."prices_19" (
    id TEXT NOT NULL,
    product_id TEXT NULL,
    active BOOLEAN NULL,
    description TEXT NULL,
    unit_amount BIGINT NULL,
    currency TEXT NULL,
    type public.pricing_type NULL,
    interval public.pricing_plan_interval NULL,
    interval_count INTEGER NULL,
    trial_period_days INTEGER NULL,
    metadata JSONB NULL,
    CONSTRAINT "prices_19_pkey" PRIMARY KEY (id),
    CONSTRAINT "prices_19_product_id_fkey" FOREIGN KEY (product_id) REFERENCES "products_19" (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR prices_19
ALTER TABLE public."prices_19" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prices_19' AND policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access"
        ON public."prices_19" FOR SELECT USING (true);
    END IF;
END $$;

-- 📦 TABLE: songs_19 (USER UPLOADED SONGS) - FIXED: renamed from 19_songs
CREATE TABLE public."songs_19" (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    title TEXT NULL,
    song_path TEXT NULL,
    author TEXT NULL,
    user_id TEXT NOT NULL,
    image_path TEXT NULL,
    CONSTRAINT "songs_19_pkey" PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR songs_19
ALTER TABLE public."songs_19" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'songs_19' AND policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access"
        ON public."songs_19" FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'songs_19' AND policyname = 'Allow users to insert their own songs') THEN
        CREATE POLICY "Allow users to insert their own songs"
        ON public."songs_19" FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'songs_19' AND policyname = 'Allow users to update their own songs') THEN
        CREATE POLICY "Allow users to update their own songs"
        ON public."songs_19" FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 📦 TABLE: liked_songs_19 - FIXED: renamed from 19_liked_songs
CREATE TABLE public."liked_songs_19" (
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    song_id BIGINT NOT NULL,
    CONSTRAINT "liked_songs_19_pkey" PRIMARY KEY (user_id, song_id),
    CONSTRAINT "liked_songs_19_song_id_fkey" FOREIGN KEY (song_id) REFERENCES "songs_19" (id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR liked_songs_19
ALTER TABLE public."liked_songs_19" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liked_songs_19' AND policyname = 'Allow users to select their own liked songs') THEN
        CREATE POLICY "Allow users to select their own liked songs"
        ON public."liked_songs_19" FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liked_songs_19' AND policyname = 'Allow users to insert their own liked songs') THEN
        CREATE POLICY "Allow users to insert their own liked songs"
        ON public."liked_songs_19" FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'liked_songs_19' AND policyname = 'Allow users to delete their own liked songs') THEN
        CREATE POLICY "Allow users to delete their own liked songs"
        ON public."liked_songs_19" FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 📦 TABLE: playlists_19 - FIXED: renamed from 19_playlists
CREATE TABLE public."playlists_19" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    user_id TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NULL,
    visibility public.playlist_visibility NOT NULL DEFAULT 'public',
    CONSTRAINT "playlists_19_pkey" PRIMARY KEY (id),
    CONSTRAINT "playlists_19_slug_key" UNIQUE (slug)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR playlists_19
ALTER TABLE public."playlists_19" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlists_19' AND policyname = 'Allow public and unlisted playlist reads') THEN
        CREATE POLICY "Allow public and unlisted playlist reads"
        ON public."playlists_19" FOR SELECT
        USING (visibility IN ('public', 'unlisted') OR auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlists_19' AND policyname = 'Allow users to insert their own playlists') THEN
        CREATE POLICY "Allow users to insert their own playlists"
        ON public."playlists_19" FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlists_19' AND policyname = 'Allow users to update their own playlists') THEN
        CREATE POLICY "Allow users to update their own playlists"
        ON public."playlists_19" FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlists_19' AND policyname = 'Allow users to delete their own playlists') THEN
        CREATE POLICY "Allow users to delete their own playlists"
        ON public."playlists_19" FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 📦 TABLE: playlist_songs_19 - FIXED: renamed from 19_playlist_songs
CREATE TABLE public."playlist_songs_19" (
    playlist_id UUID NOT NULL,
    song_id BIGINT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "playlist_songs_19_pkey" PRIMARY KEY (playlist_id, song_id),
    CONSTRAINT "playlist_songs_19_playlist_id_fkey" FOREIGN KEY (playlist_id) REFERENCES public."playlists_19" (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "playlist_songs_19_song_id_fkey" FOREIGN KEY (song_id) REFERENCES public."songs_19" (id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR playlist_songs_19
ALTER TABLE public."playlist_songs_19" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlist_songs_19' AND policyname = 'Allow readable playlist song rows') THEN
        CREATE POLICY "Allow readable playlist song rows"
        ON public."playlist_songs_19" FOR SELECT
        USING (
            EXISTS (
                SELECT 1
                FROM public."playlists_19"
                WHERE "playlists_19".id = "playlist_songs_19".playlist_id
                  AND ("playlists_19".visibility IN ('public', 'unlisted') OR "playlists_19".user_id = auth.uid())
            )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlist_songs_19' AND policyname = 'Allow owners to insert playlist songs') THEN
        CREATE POLICY "Allow owners to insert playlist songs"
        ON public."playlist_songs_19" FOR INSERT
        WITH CHECK (
            EXISTS (
                SELECT 1
                FROM public."playlists_19"
                WHERE "playlists_19".id = "playlist_songs_19".playlist_id
                  AND "playlists_19".user_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlist_songs_19' AND policyname = 'Allow owners to update playlist songs') THEN
        CREATE POLICY "Allow owners to update playlist songs"
        ON public."playlist_songs_19" FOR UPDATE
        USING (
            EXISTS (
                SELECT 1
                FROM public."playlists_19"
                WHERE "playlists_19".id = "playlist_songs_19".playlist_id
                  AND "playlists_19".user_id = auth.uid()
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1
                FROM public."playlists_19"
                WHERE "playlists_19".id = "playlist_songs_19".playlist_id
                  AND "playlists_19".user_id = auth.uid()
            )
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playlist_songs_19' AND policyname = 'Allow owners to delete playlist songs') THEN
        CREATE POLICY "Allow owners to delete playlist songs"
        ON public."playlist_songs_19" FOR DELETE
        USING (
            EXISTS (
                SELECT 1
                FROM public."playlists_19"
                WHERE "playlists_19".id = "playlist_songs_19".playlist_id
                  AND "playlists_19".user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 📦 TABLE: subscriptions_19 - FIXED: renamed from 19_subscriptions
CREATE TABLE public."subscriptions_19" (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status public.subscription_status NULL,
    metadata JSONB NULL,
    price_id TEXT NULL,
    quantity INTEGER NULL,
    cancel_at_period_end BOOLEAN NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMP WITH TIME ZONE NULL DEFAULT timezone('utc'::text, now()),
    cancel_at TIMESTAMP WITH TIME ZONE NULL DEFAULT timezone('utc'::text, now()),
    canceled_at TIMESTAMP WITH TIME ZONE NULL DEFAULT timezone('utc'::text, now()),
    trial_start TIMESTAMP WITH TIME ZONE NULL DEFAULT timezone('utc'::text, now()),
    trial_end TIMESTAMP WITH TIME ZONE NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "subscriptions_19_pkey" PRIMARY KEY (id),
    CONSTRAINT "subscriptions_19_price_id_fkey" FOREIGN KEY (price_id) REFERENCES "prices_19" (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR subscriptions_19
ALTER TABLE public."subscriptions_19" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions_19' AND policyname = 'Allow users to select their own subscriptions') THEN
        CREATE POLICY "Allow users to select their own subscriptions"
        ON public."subscriptions_19" FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- 📦 TABLE: customers_19 - FIXED: renamed from 19_customers
CREATE TABLE public."customers_19" (
    id TEXT NOT NULL,
    stripe_customer_id TEXT NULL,
    CONSTRAINT "customers_19_pkey" PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR customers_19
ALTER TABLE public."customers_19" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers_19' AND policyname = 'Allow users to select their own customer record') THEN
        CREATE POLICY "Allow users to select their own customer record"
        ON public."customers_19" FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers_19' AND policyname = 'Allow users to update their own customer record') THEN
        CREATE POLICY "Allow users to update their own customer record"
        ON public."customers_19" FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 📦 TABLE: users_19_spotify (EXTENDS auth.users)
CREATE TABLE public.users_19_spotify (
    id TEXT NOT NULL,
    full_name TEXT NULL,
    avatar_url TEXT NULL,
    billing_address JSONB NULL,
    payment_method JSONB NULL,
    CONSTRAINT users_19_spotify_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR users_19_spotify
ALTER TABLE public.users_19_spotify ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users_19_spotify' AND policyname = 'Allow users to select their own row') THEN
        CREATE POLICY "Allow users to select their own row"
        ON public.users_19_spotify FOR SELECT USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users_19_spotify' AND policyname = 'Allow users to update their own row') THEN
        CREATE POLICY "Allow users to update their own row"
        ON public.users_19_spotify FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
END $$;


-- =================================== PROJECT 23: STORE ===================================
-- =================================== PROJECT 23: STORE ===================================

-- 👥 Users Table
CREATE TABLE IF NOT EXISTS public."23_users" (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  email_confirmed_at TIMESTAMPTZ NULL,
  providers TEXT[] NULL DEFAULT '{}'
);

-- 🔐 RLS POLICIES FOR 23_users
ALTER TABLE public."23_users" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '23_users' AND policyname = 'Allow users to select their own row') THEN
        CREATE POLICY "Allow users to select their own row"
        ON public."23_users" FOR SELECT USING (auth.uid()::text = id);
    END IF;
END $$;

-- 🎫 Tickets Table
CREATE TABLE IF NOT EXISTS public."23_tickets" (
  id TEXT NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_open BOOLEAN NOT NULL DEFAULT true,
  owner_username TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  last_message_body TEXT NOT NULL DEFAULT '',
  owner_avatar_url TEXT NULL,
  rate INTEGER NULL
);

-- 🔐 RLS POLICIES FOR 23_tickets
ALTER TABLE public."23_tickets" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '23_tickets' AND policyname = 'SUPPORT/ADMIN all access') THEN
        CREATE POLICY "SUPPORT/ADMIN all access"
        ON public."23_tickets" FOR ALL USING (
            EXISTS (SELECT 1 FROM public."23_users" WHERE id = auth.uid()::text AND role IN ('SUPPORT', 'ADMIN'))
        );
    END IF;
END $$;

-- 💬 Messages Table
CREATE TABLE IF NOT EXISTS public."23_messages" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ticket_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_username TEXT NOT NULL,
  body TEXT NOT NULL,
  images TEXT[] NULL,
  seen BOOLEAN NOT NULL DEFAULT false,
  sender_avatar_url TEXT NULL
);

-- Add foreign key constraint only if table exists and we want to add it (optional)
DO $$
BEGIN
    -- Check if the constraint doesn't exist and if tickets table exists
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '23_messages_ticket_id_fkey') THEN
        IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '23_tickets') THEN
            ALTER TABLE public."23_messages"
            ADD CONSTRAINT "23_messages_ticket_id_fkey"
            FOREIGN KEY (ticket_id) REFERENCES "23_tickets"(id) ON UPDATE CASCADE ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 🔐 RLS POLICIES FOR 23_messages
ALTER TABLE public."23_messages" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '23_messages' AND policyname = 'SUPPORT/ADMIN select') THEN
        CREATE POLICY "SUPPORT/ADMIN select"
        ON public."23_messages" FOR SELECT USING (
            EXISTS (SELECT 1 FROM public."23_users" WHERE id = auth.uid()::text AND role IN ('SUPPORT', 'ADMIN'))
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '23_messages' AND policyname = 'Allow insert for everyone') THEN
        CREATE POLICY "Allow insert for everyone"
        ON public."23_messages" FOR INSERT WITH CHECK (true);
    END IF;
END $$;



-- 🛒 Products Table
CREATE TABLE IF NOT EXISTS public."23_products" (
  price_id VARCHAR NOT NULL,
  id VARCHAR NOT NULL,
  translations JSONB NOT NULL DEFAULT '{}' ::jsonb,
  price NUMERIC NOT NULL,
  img_url VARCHAR[] NOT NULL,
  on_stock INTEGER NOT NULL,
  owner_id TEXT NOT NULL,
  variants JSONB NULL,
  PRIMARY KEY (price_id, owner_id, id)
);

-- 🔐 RLS POLICIES FOR 23_products
ALTER TABLE public."23_products" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '23_products' AND policyname = 'All users select') THEN
        CREATE POLICY "All users select" ON public."23_products" FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '23_products' AND policyname = 'Owner delete') THEN
        CREATE POLICY "Owner delete" ON public."23_products" FOR DELETE USING (owner_id = auth.uid()::text);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '23_products' AND policyname = 'Auth insert') THEN
        CREATE POLICY "Auth insert" ON public."23_products" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '23_products' AND policyname = 'Owner update') THEN
        CREATE POLICY "Owner update" ON public."23_products" FOR UPDATE USING (owner_id = auth.uid()::text);
    END IF;
END $$;

-- 🛍️ Users Cart Table
CREATE TABLE IF NOT EXISTS public."23_users_cart" (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cart_products JSONB NOT NULL DEFAULT '{}' ::jsonb
);

-- 🔐 RLS POLICIES FOR 23_users_cart
ALTER TABLE public."23_users_cart" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '23_users_cart' AND policyname = 'Allow users to select their own cart') THEN
        CREATE POLICY "Allow users to select their own cart"
        ON public."23_users_cart" FOR SELECT USING (auth.uid()::text = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '23_users_cart' AND policyname = 'Allow users to update their own cart') THEN
        CREATE POLICY "Allow users to update their own cart"
        ON public."23_users_cart" FOR UPDATE USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);
    END IF;
END $$;


-- =================================== PROJECT 28: NOTION CLONE ===================================
-- Note: 28_notion-clone uses Convex backend for data persistence, not Supabase tables

-- 📊 utm_stats table (shared with other projects)
-- See shared utm_stats definition in main Supabase setup section


-- =================================== PROJECT 29: AI COMPANION ===================================

-- 👥 Users Table
CREATE TABLE public."29_users" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stripe_customer_id TEXT,
    email TEXT NOT NULL UNIQUE,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "29_users_pkey" PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR 29_users
ALTER TABLE public."29_users" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '29_users' AND policyname = 'Allow users to select their own row') THEN
        CREATE POLICY "Allow users to select their own row"
        ON public."29_users" FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

-- 📦 Category Table (MUST BE CREATED BEFORE companion)
CREATE TABLE public."29_category" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    CONSTRAINT "29_category_pkey" PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR 29_category
ALTER TABLE public."29_category" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '29_category' AND policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access"
        ON public."29_category" FOR SELECT USING (true);
    END IF;
END $$;

-- 🤖 Companion Table
CREATE TABLE public."29_companion" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES public."29_users" (id) ON UPDATE CASCADE ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public."29_category" (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    username TEXT NOT NULL,
    src TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    seed TEXT NOT NULL,
    CONSTRAINT "29_companion_pkey" PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR 29_companion
ALTER TABLE public."29_companion" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '29_companion' AND policyname = 'Allow public read access') THEN
        CREATE POLICY "Allow public read access"
        ON public."29_companion" FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '29_companion' AND policyname = 'Allow users to create companions') THEN
        CREATE POLICY "Allow users to create companions"
        ON public."29_companion" FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '29_companion' AND policyname = 'Allow users to update their own companions') THEN
        CREATE POLICY "Allow users to update their own companions"
        ON public."29_companion" FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '29_companion' AND policyname = 'Allow users to delete their own companions') THEN
        CREATE POLICY "Allow users to delete their own companions"
        ON public."29_companion" FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 💬 Messages Table
CREATE TABLE public."29_messages" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    companion_id UUID NOT NULL REFERENCES public."29_companion" (id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public."29_users" (id) ON UPDATE CASCADE ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'system')),
    content TEXT NOT NULL,
    CONSTRAINT "29_messages_pkey" PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR 29_messages
ALTER TABLE public."29_messages" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '29_messages' AND policyname = 'Allow users to view their own messages') THEN
        CREATE POLICY "Allow users to view their own messages"
        ON public."29_messages" FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '29_messages' AND policyname = 'Allow users to insert their own messages') THEN
        CREATE POLICY "Allow users to insert their own messages"
        ON public."29_messages" FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '29_messages' AND policyname = 'Allow users to delete their own messages') THEN
        CREATE POLICY "Allow users to delete their own messages"
        ON public."29_messages" FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 📋 User Subscription Table
CREATE TABLE public.user_subscription (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public."29_users" (id) ON UPDATE CASCADE ON DELETE CASCADE,
    stripe_customer_id TEXT NULL,
    stripe_subscription_id TEXT NULL,
    stripe_price_id TEXT NULL,
    stripe_current_period_end TIMESTAMPTZ NULL,
    CONSTRAINT user_subscription_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- 🔐 RLS POLICIES FOR user_subscription
ALTER TABLE public.user_subscription ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_subscription' AND policyname = 'Allow users to select their own subscription') THEN
        CREATE POLICY "Allow users to select their own subscription"
        ON public.user_subscription FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_subscription' AND policyname = 'Allow users to update their own subscription') THEN
        CREATE POLICY "Allow users to update their own subscription"
        ON public.user_subscription FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
```

<br/>

<br/>

<br/>

## Supabase edge function

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
      PERFORRM cron.unschedule('${cronJobName}');
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
