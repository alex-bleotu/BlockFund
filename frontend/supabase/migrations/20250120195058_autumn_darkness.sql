/*
  # Add wallet address to profiles

  1. Changes
    - Add wallet_address column to profiles table
    - Add index for faster wallet address lookups
    - Update RLS policies to allow users to update their own wallet address

  2. Security
    - Maintain existing RLS policies
    - Add specific policy for wallet address updates
*/

-- Add wallet_address column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wallet_address text;
    CREATE INDEX idx_profiles_wallet_address ON profiles(wallet_address);
  END IF;
END $$;

-- Update RLS policies for wallet address
CREATE POLICY "Users can update own wallet address"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);