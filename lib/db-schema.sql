-- Database schema for LetterLoop

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('coordinator', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loops table
CREATE TABLE loops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  coordinator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  send_day INTEGER CHECK (send_day >= 0 AND send_day <= 6),
  grace_period_days INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loop members table
CREATE TABLE loop_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(loop_id, user_id)
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loop questions table
CREATE TABLE loop_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  send_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loop_question_id UUID NOT NULL REFERENCES loop_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(loop_question_id, user_id)
);

-- Newsletters table
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loop_id UUID NOT NULL REFERENCES loops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  send_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Loops table policies
ALTER TABLE loops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view loops they are a member of"
  ON loops FOR SELECT
  USING (
    id IN (
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    ) OR coordinator_id = auth.uid()
  );

CREATE POLICY "Coordinators can insert loops"
  ON loops FOR INSERT
  WITH CHECK (
    auth.uid() = coordinator_id
  );

CREATE POLICY "Coordinators can update their loops"
  ON loops FOR UPDATE
  USING (
    auth.uid() = coordinator_id
  );

CREATE POLICY "Coordinators can delete their loops"
  ON loops FOR DELETE
  USING (
    auth.uid() = coordinator_id
  );

-- Loop members table policies
ALTER TABLE loop_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view loop members for loops they belong to"
  ON loop_members FOR SELECT
  USING (
    loop_id IN (
      SELECT id FROM loops WHERE coordinator_id = auth.uid()
    ) OR loop_id IN (
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can manage loop members"
  ON loop_members FOR ALL
  USING (
    loop_id IN (
      SELECT id FROM loops WHERE coordinator_id = auth.uid()
    )
  );

-- Questions table policies
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public questions or questions they created"
  ON questions FOR SELECT
  USING (
    is_public = true OR created_by = auth.uid()
  );

CREATE POLICY "Users can create questions"
  ON questions FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Users can update their own questions"
  ON questions FOR UPDATE
  USING (
    auth.uid() = created_by
  );

CREATE POLICY "Users can delete their own questions"
  ON questions FOR DELETE
  USING (
    auth.uid() = created_by
  );

-- Loop questions table policies
ALTER TABLE loop_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view loop questions for loops they belong to"
  ON loop_questions FOR SELECT
  USING (
    loop_id IN (
      SELECT id FROM loops WHERE coordinator_id = auth.uid()
    ) OR loop_id IN (
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can manage loop questions"
  ON loop_questions FOR ALL
  USING (
    loop_id IN (
      SELECT id FROM loops WHERE coordinator_id = auth.uid()
    )
  );

-- Responses table policies
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses for loops they belong to"
  ON responses FOR SELECT
  USING (
    loop_question_id IN (
      SELECT lq.id FROM loop_questions lq
      JOIN loops l ON lq.loop_id = l.id
      WHERE l.coordinator_id = auth.uid() OR
      l.id IN (
        SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own responses"
  ON responses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own responses"
  ON responses FOR UPDATE
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete their own responses"
  ON responses FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- Newsletters table policies
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view newsletters for loops they belong to"
  ON newsletters FOR SELECT
  USING (
    loop_id IN (
      SELECT id FROM loops WHERE coordinator_id = auth.uid()
    ) OR loop_id IN (
      SELECT loop_id FROM loop_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Coordinators can manage newsletters"
  ON newsletters FOR ALL
  USING (
    loop_id IN (
      SELECT id FROM loops WHERE coordinator_id = auth.uid()
    )
  );

-- Functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loops_updated_at
BEFORE UPDATE ON loops
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loop_members_updated_at
BEFORE UPDATE ON loop_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loop_questions_updated_at
BEFORE UPDATE ON loop_questions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at
BEFORE UPDATE ON responses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at
BEFORE UPDATE ON newsletters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
