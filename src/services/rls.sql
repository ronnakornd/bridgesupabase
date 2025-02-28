-- Policy for SELECT (read access)
CREATE POLICY "Instructors can select their course lesson"
ON lessons
FOR SELECT
USING (
  chapter_id::uuid IN (SELECT id FROM chapters WHERE instructor_id = ARRAY[auth.uid()::text])
);

-- Policy for INSERT (create access)
CREATE POLICY "Instructors can create chapters in their courses"
ON chapters
FOR INSERT
WITH CHECK (
  course_id IN (SELECT id FROM courses WHERE instructor_id @> ARRAY[auth.uid()::text])
);

-- Policy for UPDATE (edit access)
CREATE POLICY "Instructors can update their course chapters"
ON chapters
FOR UPDATE
USING (
  course_id IN (SELECT id FROM courses WHERE instructor_id @> ARRAY[auth.uid()::text])
)
WITH CHECK (
  course_id IN (SELECT id FROM courses WHERE instructor_id @> ARRAY[auth.uid()::text])
);

-- Policy for DELETE (delete access)
CREATE POLICY "Instructors can delete their course chapters"
ON chapters
FOR DELETE
USING (
  course_id IN (SELECT id FROM courses WHERE instructor_id @> ARRAY[auth.uid()::text])
);