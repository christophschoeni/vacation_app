-- Supabase Schema for Vacation App Cloud Sync (Phase 3)
-- This file should be executed in the Supabase SQL Editor

-- Enable UUID extension


-- ========================================
-- Shared Vacations Table
-- ========================================
CREATE TABLE IF NOT EXISTS shared_vacations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id TEXT UNIQUE NOT NULL,
  destination TEXT NOT NULL,
  country TEXT NOT NULL,
  hotel TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  budget NUMERIC,
  budget_currency TEXT NOT NULL DEFAULT 'CHF',
  currency TEXT NOT NULL DEFAULT 'CHF',
  image_url TEXT,
  is_shared BOOLEAN NOT NULL DEFAULT TRUE,
  participant_count INTEGER NOT NULL DEFAULT 1,
  owner_device_id TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- Shared Participants Table
-- ========================================
CREATE TABLE IF NOT EXISTS shared_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacation_id UUID REFERENCES shared_vacations(id) ON DELETE CASCADE,
  local_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  device_id TEXT,
  is_owner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vacation_id, name)
);

-- ========================================
-- Shared Expenses Table
-- ========================================
CREATE TABLE IF NOT EXISTS shared_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacation_id UUID REFERENCES shared_vacations(id) ON DELETE CASCADE,
  local_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  amount_chf NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  paid_by UUID REFERENCES shared_participants(id),
  split_type TEXT NOT NULL DEFAULT 'equal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- Shared Expense Splits Table
-- ========================================
CREATE TABLE IF NOT EXISTS shared_expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES shared_expenses(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES shared_participants(id) ON DELETE CASCADE,
  share_amount NUMERIC NOT NULL,
  share_percentage NUMERIC,
  is_payer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(expense_id, participant_id)
);

-- ========================================
-- Access Codes Table
-- ========================================
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacation_id UUID REFERENCES shared_vacations(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- Indexes for Performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_shared_vacations_local_id ON shared_vacations(local_id);
CREATE INDEX IF NOT EXISTS idx_shared_vacations_owner ON shared_vacations(owner_device_id);
CREATE INDEX IF NOT EXISTS idx_shared_participants_vacation ON shared_participants(vacation_id);
CREATE INDEX IF NOT EXISTS idx_shared_expenses_vacation ON shared_expenses(vacation_id);
CREATE INDEX IF NOT EXISTS idx_shared_expense_splits_expense ON shared_expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_shared_expense_splits_participant ON shared_expense_splits(participant_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_vacation ON access_codes(vacation_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);

-- ========================================
-- Row Level Security (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE shared_vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS Policies
-- ========================================

-- Shared Vacations Policies
-- Users can read vacations they own or have joined via access code
CREATE POLICY "Users can read their own vacations"
  ON shared_vacations FOR SELECT
  USING (
    owner_device_id = auth.uid()::text
    OR id IN (
      SELECT vacation_id
      FROM shared_participants
      WHERE device_id = auth.uid()::text
    )
  );

-- Users can insert vacations they own
CREATE POLICY "Users can insert their own vacations"
  ON shared_vacations FOR INSERT
  WITH CHECK (owner_device_id = auth.uid()::text);

-- Users can update vacations they own or participate in
CREATE POLICY "Users can update their vacations"
  ON shared_vacations FOR UPDATE
  USING (
    owner_device_id = auth.uid()::text
    OR id IN (
      SELECT vacation_id
      FROM shared_participants
      WHERE device_id = auth.uid()::text
    )
  );

-- Users can delete vacations they own
CREATE POLICY "Users can delete their own vacations"
  ON shared_vacations FOR DELETE
  USING (owner_device_id = auth.uid()::text);

-- Shared Participants Policies
CREATE POLICY "Users can read participants of their vacations"
  ON shared_participants FOR SELECT
  USING (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
      OR id IN (
        SELECT vacation_id
        FROM shared_participants
        WHERE device_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can insert participants to their vacations"
  ON shared_participants FOR INSERT
  WITH CHECK (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
      OR id IN (
        SELECT vacation_id
        FROM shared_participants
        WHERE device_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can update participants in their vacations"
  ON shared_participants FOR UPDATE
  USING (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
    )
  );

CREATE POLICY "Owners can delete participants"
  ON shared_participants FOR DELETE
  USING (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
    )
  );

-- Shared Expenses Policies
CREATE POLICY "Users can read expenses of their vacations"
  ON shared_expenses FOR SELECT
  USING (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
      OR id IN (
        SELECT vacation_id
        FROM shared_participants
        WHERE device_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can insert expenses to their vacations"
  ON shared_expenses FOR INSERT
  WITH CHECK (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
      OR id IN (
        SELECT vacation_id
        FROM shared_participants
        WHERE device_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can update expenses in their vacations"
  ON shared_expenses FOR UPDATE
  USING (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
      OR id IN (
        SELECT vacation_id
        FROM shared_participants
        WHERE device_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can delete expenses in their vacations"
  ON shared_expenses FOR DELETE
  USING (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
      OR id IN (
        SELECT vacation_id
        FROM shared_participants
        WHERE device_id = auth.uid()::text
      )
    )
  );

-- Shared Expense Splits Policies
CREATE POLICY "Users can read expense splits of their vacations"
  ON shared_expense_splits FOR SELECT
  USING (
    expense_id IN (
      SELECT id FROM shared_expenses
      WHERE vacation_id IN (
        SELECT id FROM shared_vacations
        WHERE owner_device_id = auth.uid()::text
        OR id IN (
          SELECT vacation_id
          FROM shared_participants
          WHERE device_id = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can insert expense splits to their vacations"
  ON shared_expense_splits FOR INSERT
  WITH CHECK (
    expense_id IN (
      SELECT id FROM shared_expenses
      WHERE vacation_id IN (
        SELECT id FROM shared_vacations
        WHERE owner_device_id = auth.uid()::text
        OR id IN (
          SELECT vacation_id
          FROM shared_participants
          WHERE device_id = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can update expense splits in their vacations"
  ON shared_expense_splits FOR UPDATE
  USING (
    expense_id IN (
      SELECT id FROM shared_expenses
      WHERE vacation_id IN (
        SELECT id FROM shared_vacations
        WHERE owner_device_id = auth.uid()::text
        OR id IN (
          SELECT vacation_id
          FROM shared_participants
          WHERE device_id = auth.uid()::text
        )
      )
    )
  );

CREATE POLICY "Users can delete expense splits in their vacations"
  ON shared_expense_splits FOR DELETE
  USING (
    expense_id IN (
      SELECT id FROM shared_expenses
      WHERE vacation_id IN (
        SELECT id FROM shared_vacations
        WHERE owner_device_id = auth.uid()::text
        OR id IN (
          SELECT vacation_id
          FROM shared_participants
          WHERE device_id = auth.uid()::text
        )
      )
    )
  );

-- Access Codes Policies
CREATE POLICY "Anyone can read valid access codes"
  ON access_codes FOR SELECT
  USING (
    expires_at IS NULL OR expires_at > NOW()
  );

CREATE POLICY "Owners can insert access codes"
  ON access_codes FOR INSERT
  WITH CHECK (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
    )
  );

CREATE POLICY "Owners can update access codes"
  ON access_codes FOR UPDATE
  USING (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
    )
  );

CREATE POLICY "Owners can delete access codes"
  ON access_codes FOR DELETE
  USING (
    vacation_id IN (
      SELECT id FROM shared_vacations
      WHERE owner_device_id = auth.uid()::text
    )
  );

-- ========================================
-- Functions
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_shared_vacations_updated_at
    BEFORE UPDATE ON shared_vacations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
