# Banners title field note

- The `public.banners` table does not have a top-level `title` column.
- The Admin UI includes a "Título" field for convenience; this value is now stored under `banners.meta->>title` (JSONB) to avoid schema changes.
- All reads now prefer `banner.alt` and fall back to `banner.meta.title`.
- When saving, we map the UI `title` into `meta.title` and remove the top-level field from the payload so Supabase doesn't error.

How to query in SQL:

-- List banners with their meta title
SELECT id, type, alt, href, height, meta->>'title' AS meta_title
FROM public.banners
ORDER BY created_at DESC
LIMIT 50;

If you prefer a dedicated column later, run a migration like:

ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS title text;
-- And update Admin to stop nesting under meta.
