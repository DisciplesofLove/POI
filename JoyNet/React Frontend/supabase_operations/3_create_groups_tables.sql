-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  creator_id UUID REFERENCES auth.users NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES groups NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create group_messages table
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES groups NOT NULL,
  sender_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for groups
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Policy for users to view groups they are members of or public groups
CREATE POLICY "Users can view groups they are members of or public groups" 
ON groups FOR SELECT USING (
  NOT is_private OR 
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = id AND user_id = auth.uid()
  ) OR
  creator_id = auth.uid()
);

-- Policy for users to insert groups
CREATE POLICY "Users can create groups" 
ON groups FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Policy for group creators to update their groups
CREATE POLICY "Group creators can update their groups" 
ON groups FOR UPDATE USING (auth.uid() = creator_id);

-- Policy for group creators to delete their groups
CREATE POLICY "Group creators can delete their groups" 
ON groups FOR DELETE USING (auth.uid() = creator_id);

-- Create RLS policies for group_members
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Policy for users to view members of groups they belong to
CREATE POLICY "Users can view members of groups they belong to" 
ON group_members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = group_members.group_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM groups
    WHERE id = group_members.group_id AND creator_id = auth.uid()
  )
);

-- Policy for users to join public groups
CREATE POLICY "Users can join public groups" 
ON group_members FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  NOT EXISTS (
    SELECT 1 FROM groups
    WHERE id = group_id AND is_private = TRUE
  )
);

-- Policy for group creators to add members
CREATE POLICY "Group creators can add members" 
ON group_members FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups
    WHERE id = group_id AND creator_id = auth.uid()
  )
);

-- Policy for users to leave groups
CREATE POLICY "Users can leave groups" 
ON group_members FOR DELETE USING (auth.uid() = user_id);

-- Policy for group creators to remove members
CREATE POLICY "Group creators can remove members" 
ON group_members FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM groups
    WHERE id = group_members.group_id AND creator_id = auth.uid()
  )
);

-- Create RLS policies for group_messages
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to view messages in groups they belong to
CREATE POLICY "Users can view messages in groups they belong to" 
ON group_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM groups
    WHERE id = group_messages.group_id AND creator_id = auth.uid()
  )
);

-- Policy for users to send messages to groups they belong to
CREATE POLICY "Users can send messages to groups they belong to" 
ON group_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = group_messages.group_id AND user_id = auth.uid()
  )
);

-- Create trigger to update updated_at column
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
