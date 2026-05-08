-- 1. Restore strict security for Drivers
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users on drivers" ON drivers;
DROP POLICY IF EXISTS "Enable read access for all users on drivers" ON drivers;
DROP POLICY IF EXISTS "Enable all access for authenticated users on drivers" ON drivers;

-- Anyone can read drivers (so the public request form can list them if needed)
CREATE POLICY "Enable read access for all users on drivers" ON drivers FOR SELECT USING (true);
-- ONLY logged in admins can add/edit/delete drivers
CREATE POLICY "Enable all access for authenticated users on drivers" ON drivers FOR ALL USING (auth.role() = 'authenticated');

-- 2. Restore strict security for Movement Plans
ALTER TABLE movement_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users on movement_plans" ON movement_plans;
DROP POLICY IF EXISTS "Enable read access for all users on movement_plans" ON movement_plans;
DROP POLICY IF EXISTS "Enable insert for all users on movement_plans" ON movement_plans;
DROP POLICY IF EXISTS "Enable all access for authenticated users on movement_plans" ON movement_plans;

-- Anyone can read plans (so public can see the schedule if you want)
CREATE POLICY "Enable read access for all users on movement_plans" ON movement_plans FOR SELECT USING (true);
-- ANYONE can submit a new movement request (public form)
CREATE POLICY "Enable insert for all users on movement_plans" ON movement_plans FOR INSERT WITH CHECK (true);
-- ONLY logged in admins can update (approve/reject/assign) or delete plans
CREATE POLICY "Enable update and delete for authenticated users" ON movement_plans FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON movement_plans FOR DELETE USING (auth.role() = 'authenticated');
