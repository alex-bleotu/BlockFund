/*
  # Update Messages System Policies

  1. Changes
    - Add validation function for message updates
    - Add trigger for update validation
    - Add policy for updating read status

  2. Security
    - Ensure only message recipients can update read status
    - Validate that only read status can be changed
*/

-- Create a function to validate read status updates
CREATE OR REPLACE FUNCTION validate_message_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow updating the read status
  IF NEW.campaign_id = OLD.campaign_id
    AND NEW.sender_id = OLD.sender_id
    AND NEW.receiver_id = OLD.receiver_id
    AND NEW.subject = OLD.subject
    AND NEW.content = OLD.content
    AND NEW.created_at = OLD.created_at
    AND NEW.read IS DISTINCT FROM OLD.read THEN
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for update validation
DROP TRIGGER IF EXISTS validate_message_update_trigger ON messages;
CREATE TRIGGER validate_message_update_trigger
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION validate_message_update();

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update read status of received messages" ON messages;

-- Create update policy
CREATE POLICY "Users can update read status of received messages"
  ON messages
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);