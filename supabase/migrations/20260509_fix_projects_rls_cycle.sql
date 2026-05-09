-- Fix circular RLS between projects and project_members.
-- The "project_member_read" policy on projects queries project_members,
-- whose "members_by_owner" policy queries back to projects → infinite recursion.
-- Dropping "project_member_read" breaks the cycle; owners still have full access
-- via the existing "project_owner" policy.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects'
  ) THEN
    DROP POLICY IF EXISTS "project_member_read" ON projects;
  END IF;
END $$;
