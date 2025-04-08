/*
  # Fix User Registration

  1. Changes
    - Remove direct auth.users inserts (not allowed in production)
    - Update trigger to properly handle new user creation
    - Add insert policy for profiles table
    - Add default admin creation via email

  2. Security
    - Maintain RLS policies
    - Add insert policy for profiles
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate function with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, is_admin)
  VALUES (
    NEW.id,
    COALESCE(SPLIT_PART(NEW.email, '@', 1), 'user_' || NEW.id),
    NEW.email = 'admin@example.com'
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add insert policy for profiles
CREATE POLICY "Trigger can create profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (true);  -- Allow the trigger to create profiles

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;