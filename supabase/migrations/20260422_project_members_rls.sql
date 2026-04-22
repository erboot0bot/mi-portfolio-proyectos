-- RLS policies for project_members
-- Owners can manage membership for their projects
CREATE POLICY "members_by_owner"
  ON project_members
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Users can see their own membership records
CREATE POLICY "members_read_own"
  ON project_members
  FOR SELECT
  USING (user_id = auth.uid());
