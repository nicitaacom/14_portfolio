# Admin Dashboard Click Tracking

## How it works

`user clicks project link -> TrackedProjectLink uses ProjectClicksSDK -> API request sent -> API inserts row if this project was not tracked today for this user -> /admin-dashboard reads SQL data -> charts show clicks`

- Track only project card links: `demo`, `github`, `figma`, `youtube`
- Do not track `More info`
- Same user + same project = only `1` tracked row per day
- Day uses user timezone from `moment.tz.guess()`
- Dashboard read flow: `Component -> hook -> ProjectClicksSDK -> API -> DB`
- `Monthly` = last 30 days by day
- `Yearly` = last 12 months by month

## SQL to run in Supabase

```sql
-- =================================== 📊 project_link_clicks table ===================================

CREATE TABLE IF NOT EXISTS public.project_link_clicks (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  project_slug TEXT NOT NULL,
  project_name TEXT NOT NULL,
  project_group TEXT NOT NULL,

  link_type TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  page_path TEXT NOT NULL DEFAULT '/',
  user_cookie_id VARCHAR(255) NOT NULL,
  user_timezone TEXT NOT NULL,
  user_local_date DATE NOT NULL,

  CONSTRAINT project_link_clicks_link_type_check
    CHECK (link_type IN ('demo', 'github', 'figma', 'youtube'))
);

CREATE INDEX IF NOT EXISTS idx_project_link_clicks_clicked_at
  ON public.project_link_clicks (clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_link_clicks_project_slug_clicked_at
  ON public.project_link_clicks (project_slug, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_link_clicks_project_group_clicked_at
  ON public.project_link_clicks (project_group, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_link_clicks_link_type_clicked_at
  ON public.project_link_clicks (link_type, clicked_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_link_clicks_unique_daily_project_user
  ON public.project_link_clicks (project_slug, user_cookie_id, user_local_date);

-- 🔐 RLS Policies
ALTER TABLE public.project_link_clicks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_link_clicks' AND policyname = 'Allow select for everyone') THEN
        CREATE POLICY "Allow select for everyone" ON public.project_link_clicks FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_link_clicks' AND policyname = 'Allow insert for everyone') THEN
        CREATE POLICY "Allow insert for everyone" ON public.project_link_clicks FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_link_clicks' AND policyname = 'Allow update for everyone') THEN
        CREATE POLICY "Allow update for everyone" ON public.project_link_clicks FOR UPDATE USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_link_clicks' AND policyname = 'Allow delete for everyone') THEN
        CREATE POLICY "Allow delete for everyone" ON public.project_link_clicks FOR DELETE USING (true);
    END IF;
END
$$;

ALTER TABLE public.project_link_clicks FORCE ROW LEVEL SECURITY;

-- =================================== 📈 get_project_clicks_overview ===================================

CREATE OR REPLACE FUNCTION public.get_project_clicks_overview(p_window TEXT DEFAULT 'monthly')
RETURNS TABLE (
  project_slug TEXT,
  project_name TEXT,
  project_group TEXT,
  total_clicks BIGINT,
  demo_clicks BIGINT,
  github_clicks BIGINT,
  figma_clicks BIGINT,
  youtube_clicks BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH filtered AS (
    SELECT *
    FROM public.project_link_clicks
    WHERE clicked_at >= CASE
      WHEN p_window = 'yearly' THEN now() - interval '12 months'
      ELSE now() - interval '30 days'
    END
  )
  SELECT
    project_slug,
    max(project_name) AS project_name,
    max(project_group) AS project_group,
    count(*)::BIGINT AS total_clicks,
    count(*) FILTER (WHERE link_type = 'demo')::BIGINT AS demo_clicks,
    count(*) FILTER (WHERE link_type = 'github')::BIGINT AS github_clicks,
    count(*) FILTER (WHERE link_type = 'figma')::BIGINT AS figma_clicks,
    count(*) FILTER (WHERE link_type = 'youtube')::BIGINT AS youtube_clicks
  FROM filtered
  GROUP BY project_slug
  ORDER BY total_clicks DESC, project_slug ASC;
$$;

-- =================================== 📉 get_project_clicks_timeline ===================================

CREATE OR REPLACE FUNCTION public.get_project_clicks_timeline(
  p_project_slug TEXT,
  p_window TEXT DEFAULT 'monthly'
)
RETURNS TABLE (
  bucket_key TEXT,
  bucket_label TEXT,
  total_clicks BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH config AS (
    SELECT
      CASE
        WHEN p_window = 'yearly' THEN 'month'
        ELSE 'day'
      END AS bucket_unit,
      CASE
        WHEN p_window = 'yearly' THEN date_trunc('month', now()) - interval '11 months'
        ELSE date_trunc('day', now()) - interval '29 days'
      END AS start_at,
      CASE
        WHEN p_window = 'yearly' THEN date_trunc('month', now())
        ELSE date_trunc('day', now())
      END AS end_at
  ),
  series AS (
    SELECT
      generate_series(
        (SELECT start_at FROM config),
        (SELECT end_at FROM config),
        CASE
          WHEN (SELECT bucket_unit FROM config) = 'month' THEN interval '1 month'
          ELSE interval '1 day'
        END
      ) AS bucket_start
  ),
  aggregated AS (
    SELECT
      CASE
        WHEN p_window = 'yearly' THEN date_trunc('month', clicked_at)
        ELSE date_trunc('day', clicked_at)
      END AS bucket_start,
      count(*)::BIGINT AS total_clicks
    FROM public.project_link_clicks
    WHERE project_slug = p_project_slug
      AND clicked_at >= (SELECT start_at FROM config)
    GROUP BY 1
  )
  SELECT
    CASE
      WHEN p_window = 'yearly' THEN to_char(series.bucket_start, 'YYYY-MM')
      ELSE to_char(series.bucket_start, 'YYYY-MM-DD')
    END AS bucket_key,
    CASE
      WHEN p_window = 'yearly' THEN to_char(series.bucket_start, 'Mon')
      ELSE to_char(series.bucket_start, 'DD Mon')
    END AS bucket_label,
    COALESCE(aggregated.total_clicks, 0)::BIGINT AS total_clicks
  FROM series
  LEFT JOIN aggregated ON aggregated.bucket_start = series.bucket_start
  ORDER BY series.bucket_start ASC;
$$;
```
