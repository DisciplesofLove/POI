-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to view messages they sent or received
CREATE POLICY "Users can view their own messages" 
ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Policy for users to insert messages they send
CREATE POLICY "Users can insert messages they send" 
ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policy for users to update read status of messages they received
CREATE POLICY "Users can update read status of received messages" 
ON messages FOR UPDATE USING (auth.uid() = recipient_id)
WITH CHECK (
  auth.uid() = recipient_id AND
  OLD.is_read = FALSE AND
  NEW.is_read = TRUE AND
  OLD.content = NEW.content AND
  OLD.sender_id = NEW.sender_id AND
  OLD.recipient_id = NEW.recipient_id
);

-- Create conversations view for easier queries
CREATE OR REPLACE VIEW conversations AS
WITH latest_messages AS (
  SELECT 
    DISTINCT ON (
      LEAST(sender_id, recipient_id), 
      GREATEST(sender_id, recipient_id)
    ) 
    id,
    sender_id,
    recipient_id,
    content,
    is_read,
    created_at
  FROM messages
  ORDER BY 
    LEAST(sender_id, recipient_id), 
    GREATEST(sender_id, recipient_id), 
    created_at DESC
)
SELECT 
  m.id,
  m.sender_id,
  m.recipient_id,
  m.content,
  m.is_read,
  m.created_at,
  sender_profile.username as sender_username,
  sender_profile.avatar_url as sender_avatar,
  recipient_profile.username as recipient_username,
  recipient_profile.avatar_url as recipient_avatar
FROM latest_messages m
JOIN profiles sender_profile ON m.sender_id = sender_profile.id
JOIN profiles recipient_profile ON m.recipient_id = recipient_profile.id;

-- Create unread messages count function
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM messages
    WHERE recipient_id = user_id AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(sender_uuid UUID, recipient_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET is_read = TRUE
  WHERE sender_id = sender_uuid AND recipient_id = recipient_uuid AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql;
