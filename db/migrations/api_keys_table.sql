-- Drop existing table if it exists
DROP TABLE IF EXISTS api_keys;

-- Create the api_keys table with updated schema
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_key TEXT NOT NULL,
  iv TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX api_keys_user_id_idx ON api_keys(user_id);

-- Add row-level security policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
CREATE POLICY "Users can view their own API keys" 
  ON api_keys FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only insert their own API keys
CREATE POLICY "Users can insert their own API keys" 
  ON api_keys FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own API keys
CREATE POLICY "Users can update their own API keys" 
  ON api_keys FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can only delete their own API keys
CREATE POLICY "Users can delete their own API keys" 
  ON api_keys FOR DELETE 
  USING (auth.uid() = user_id);

