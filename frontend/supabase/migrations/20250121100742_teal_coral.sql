/*
  # Create campaigns table and policies

  1. New Tables
    - `campaigns`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `title` (text)
      - `category` (text)
      - `goal` (numeric)
      - `summary` (text)
      - `description` (text)
      - `images` (text array)
      - `location` (text, nullable)
      - `deadline` (timestamptz)
      - `created_at` (timestamptz)
      - `raised` (numeric)
      - `status` (text)

  2. Security
    - Enable RLS on `campaigns` table
    - Add policies for:
      - Anyone can view active campaigns
      - Authenticated users can create campaigns
      - Users can update their own campaigns
      - Users can delete their own campaigns
*/

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  goal numeric NOT NULL CHECK (goal > 0),
  summary text NOT NULL,
  description text NOT NULL,
  images text[] NOT NULL DEFAULT '{}',
  location text,
  deadline timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  raised numeric NOT NULL DEFAULT 0 CHECK (raised >= 0),
  status text NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'cancelled')) DEFAULT 'active'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active campaigns"
  ON campaigns
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can create campaigns"
  ON campaigns
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own campaigns"
  ON campaigns
  FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns
  FOR DELETE
  USING (auth.uid() = creator_id);

-- Add some sample campaigns
INSERT INTO campaigns (
  creator_id,
  title,
  category,
  goal,
  summary,
  description,
  location,
  deadline,
  images
) VALUES
(
  (SELECT id FROM profiles WHERE username = 'test'),
  'Decentralized Education Platform',
  'Education',
  5.0,
  'Building a blockchain-based platform to make education accessible to everyone.',
  'Our mission is to revolutionize education by creating a decentralized platform where anyone can learn and teach. The platform will use blockchain technology to verify credentials and smart contracts to handle payments.',
  'Global',
  now() + interval '30 days',
  ARRAY['https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80']
),
(
  (SELECT id FROM profiles WHERE username = 'test'),
  'Sustainable Energy Marketplace',
  'Environment',
  10.0,
  'Creating a marketplace for renewable energy credits using blockchain.',
  'We''re developing a platform that allows individuals and businesses to trade renewable energy credits using smart contracts, making green energy more accessible and transparent.',
  'Europe',
  now() + interval '45 days',
  ARRAY['https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80']
),
(
  (SELECT id FROM profiles WHERE username = 'test'),
  'Community Art Gallery DAO',
  'Art',
  3.0,
  'A decentralized autonomous organization for community-owned art galleries.',
  'We''re building a DAO that will allow communities to collectively own and manage art galleries. Members can vote on exhibitions, acquisitions, and gallery operations.',
  'New York',
  now() + interval '60 days',
  ARRAY['https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80']
);