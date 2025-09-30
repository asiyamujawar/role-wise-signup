/*
  # Create evidences table for file uploads

  1. New Tables
    - `evidences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `file_name` (text)
      - `file_type` (text)
      - `cid` (text, content identifier)
      - `criticality` (enum: low, medium, high)
      - `upload_time` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `evidences` table
    - Add policy for users to read/write their own evidence
*/

-- Create enum for criticality levels
CREATE TYPE criticality_level AS ENUM ('low', 'medium', 'high');

-- Create evidences table
CREATE TABLE IF NOT EXISTS evidences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  cid text NOT NULL,
  criticality criticality_level NOT NULL DEFAULT 'low',
  upload_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE evidences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own evidence"
  ON evidences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evidence"
  ON evidences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evidence"
  ON evidences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own evidence"
  ON evidences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);