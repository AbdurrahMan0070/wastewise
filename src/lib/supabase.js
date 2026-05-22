import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── SUPABASE SQL TO RUN IN YOUR PROJECT ────────────────────────────────────
//
// Run this in Supabase → SQL Editor:
//
// create table items (
//   id uuid default gen_random_uuid() primary key,
//   barcode text unique,
//   name text not null,
//   category text not null,
//   disposal_method text not null,
//   instructions text,
//   tips text,
//   co2_saved numeric default 0,
//   tagged_by text,
//   verified boolean default false,
//   created_at timestamptz default now()
// );
//
// create table scans (
//   id uuid default gen_random_uuid() primary key,
//   username text not null,
//   item_name text not null,
//   category text not null,
//   points integer default 1,
//   co2_saved numeric default 0,
//   city text,
//   created_at timestamptz default now()
// );
//
// create table users (
//   id uuid default gen_random_uuid() primary key,
//   username text unique not null,
//   city text,
//   total_points integer default 0,
//   items_scanned integer default 0,
//   items_tagged integer default 0,
//   co2_saved numeric default 0,
//   created_at timestamptz default now()
// );
//
// create table facilities (
//   id uuid default gen_random_uuid() primary key,
//   name text not null,
//   type text not null,
//   lat numeric not null,
//   lng numeric not null,
//   city text,
//   address text,
//   accepts text[],
//   created_at timestamptz default now()
// );
//
// -- Enable RLS but allow all for demo
// alter table items enable row level security;
// alter table scans enable row level security;
// alter table users enable row level security;
// alter table facilities enable row level security;
//
// create policy "allow all" on items for all using (true) with check (true);
// create policy "allow all" on scans for all using (true) with check (true);
// create policy "allow all" on users for all using (true) with check (true);
// create policy "allow all" on facilities for all using (true) with check (true);
//
// -- Seed some items
// insert into items (barcode, name, category, disposal_method, instructions, tips, co2_saved, verified) values
// ('012345678901', 'Plastic Water Bottle', 'Recyclable', 'Blue Bin', 'Rinse and remove cap before recycling. Crush to save space.', 'Caps are often not recyclable separately — check locally.', 0.1, true),
// ('012345678902', 'Newspaper', 'Recyclable', 'Blue Bin', 'Keep dry. Bundle together or place in recycling bag.', 'Wet newspaper goes in compost, not recycling.', 0.05, true),
// ('012345678903', 'AA Battery', 'Hazardous', 'Hazardous Waste Facility', 'Never throw in regular trash. Take to a battery drop-off point.', 'Many electronics stores accept old batteries for free.', 0.2, true),
// ('012345678904', 'Glass Bottle', 'Glass', 'Green Bin / Glass Bank', 'Rinse thoroughly. Remove lids and corks.', 'Labels do not need to be removed.', 0.15, true),
// ('012345678905', 'Banana Peel', 'Compostable', 'Brown Bin / Compost', 'Place in compost bin or food waste collection.', 'Great for home composting — speeds up decomposition.', 0.03, true),
// ('012345678906', 'Old Smartphone', 'E-Waste', 'E-Waste Facility', 'Take to an authorized e-waste facility. Never throw in regular trash.', 'Many manufacturers have take-back programs.', 0.5, true),
// ('012345678907', 'Cardboard Box', 'Recyclable', 'Blue Bin', 'Flatten before recycling. Remove all tape and staples.', 'Pizza boxes with grease go in compost, not recycling.', 0.08, true),
// ('012345678908', 'Styrofoam Cup', 'General Waste', 'Black Bin', 'Most styrofoam is not recyclable. Place in general waste.', 'Some specialist facilities accept styrofoam — check locally.', 0, true);
//
// -- Seed some facilities (Mumbai area)
// insert into facilities (name, type, lat, lng, city, address, accepts) values
// ('Dharavi Recycling Hub', 'Recycling', 19.0411, 72.8542, 'Mumbai', 'Dharavi, Mumbai', ARRAY['Recyclable', 'Glass', 'E-Waste']),
// ('BMC Waste Facility', 'General', 19.0760, 72.8777, 'Mumbai', 'Andheri East, Mumbai', ARRAY['General Waste', 'Hazardous']),
// ('GreenCycle E-Waste', 'E-Waste', 19.1136, 72.8697, 'Mumbai', 'Borivali West, Mumbai', ARRAY['E-Waste']),
// ('Sion Composting Unit', 'Compost', 19.0390, 72.8619, 'Mumbai', 'Sion, Mumbai', ARRAY['Compostable']),
// ('Bandra Battery Drop', 'Hazardous', 19.0596, 72.8295, 'Mumbai', 'Bandra West, Mumbai', ARRAY['Hazardous']);
