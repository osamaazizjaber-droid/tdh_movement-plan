-- 1. Create Drivers Table
CREATE TABLE drivers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  car_type text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Movement Plans Table
CREATE TABLE movement_plans (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team text NOT NULL,
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  shift text, -- 'Morning' or 'Evening', assigned by Admin
  status text DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
  date date NOT NULL,
  destination text NOT NULL,
  passengers text,
  purpose text,
  departure_time time,
  return_time time,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Setup Row Level Security (RLS)
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on drivers" ON drivers FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users on drivers" ON drivers FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE movement_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users on movement_plans" ON movement_plans FOR SELECT USING (true);
-- Allow public insert for movement requests
CREATE POLICY "Enable insert for all users on movement_plans" ON movement_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users on movement_plans" ON movement_plans FOR ALL USING (auth.role() = 'authenticated');
