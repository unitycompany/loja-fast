-- Fix banner URLs that start with /http or /https
-- This removes the leading slash from external URLs

UPDATE banners
SET href = SUBSTRING(href FROM 2)
WHERE href LIKE '/http%';

-- Alternative: If the href is stored in a JSON column (like 'data' or 'meta')
-- UPDATE banners
-- SET data = jsonb_set(
--   data,
--   '{href}',
--   to_jsonb(SUBSTRING(data->>'href' FROM 2))
-- )
-- WHERE data->>'href' LIKE '/http%';

-- Check the results
SELECT id, href, type, alt
FROM banners
WHERE href LIKE 'http%'
ORDER BY created_at DESC;
