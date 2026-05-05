-- Fix: slug must be unique per owner, not globally unique
-- Previously: slug TEXT UNIQUE → fails when two users have same app slug
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_slug_key;
ALTER TABLE projects ADD CONSTRAINT projects_slug_owner_unique UNIQUE (slug, owner_id);
