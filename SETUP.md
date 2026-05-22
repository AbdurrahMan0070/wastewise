# WasteWise Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose any name, password, and region)
3. Wait for the project to finish setting up (~2 minutes)
4. Go to **SQL Editor** in the left sidebar
5. Click **New Query** and paste this SQL:

```sql
-- Create users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  scans INTEGER DEFAULT 0,
  tags INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  barcode TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('recyclable', 'trash', 'hazardous', 'compost')),
  notes TEXT,
  tagged_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for demo purposes)
CREATE POLICY "Allow public read access on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on users" ON users FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on products" ON products FOR INSERT WITH CHECK (true);
```

6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### 3. Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click **API** in the left menu
3. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### 4. Create Environment File

Create a file named `.env` in the root folder and add:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the values with what you copied from Supabase.

### 5. Run the App

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

## Testing the App

### Test Barcode Scanning
1. Click the **Scan** tab
2. Click **Start Camera Scanner** (allow camera access)
3. Scan any product barcode OR enter one manually (try: `012000161155`)
4. If not found, tag it and earn 10 points!

### Test Leaderboard
1. Click the **Leaderboard** tab
2. You should see yourself and any other users
3. Open the app in another browser/device to see real-time updates

### Test Map
1. Click the **Find Facilities** tab
2. Click **Find Facilities Near Me** (allow location access)
3. The map will show nearby recycling centers from OpenStreetMap

### Test Dashboard
1. Click the **Impact** tab
2. See real-time stats from your Supabase database
3. All numbers are live from the database (no fake data!)

## Optional: Add Sample Data

If you want to pre-populate some products for demos, run this in Supabase SQL Editor:

```sql
INSERT INTO products (barcode, product_name, category, notes) VALUES
('012000161155', 'Coca-Cola Can', 'recyclable', 'Aluminum can - rinse before recycling'),
('078742370088', 'Plastic Water Bottle', 'recyclable', 'Remove cap and rinse'),
('041220576463', 'AA Battery', 'hazardous', 'Take to hazardous waste facility'),
('041303054796', 'Banana Peel', 'compost', 'Perfect for composting'),
('070847811329', 'Styrofoam Cup', 'trash', 'Not recyclable in most areas');
```

## Troubleshooting

### Map shows black screen
- Make sure you ran `npm install` after the latest changes
- Check browser console for errors
- Ensure you have internet connection (map tiles load from OpenStreetMap)

### "Error looking up product"
- Check your `.env` file has correct Supabase credentials
- Verify the tables were created in Supabase SQL Editor
- Check browser console for specific error messages

### Camera not working
- Ensure you're using HTTPS or localhost (camera requires secure context)
- Allow camera permissions when prompted
- Try a different browser if issues persist

### Leaderboard empty
- Scan or tag at least one item to create your user
- Check Supabase dashboard → Table Editor → users to see if data is there

## Deployment

### Deploy to Vercel (Free)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Deploy to Netlify (Free)
1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag and drop the `dist` folder
4. Go to Site Settings → Environment Variables
5. Add your Supabase credentials
6. Redeploy

## Features Checklist

- ✅ Real-time barcode scanning (camera + manual)
- ✅ Community tagging system (earn points)
- ✅ Live leaderboard (updates every 10 seconds)
- ✅ Interactive map (real OpenStreetMap data)
- ✅ Impact dashboard (real Supabase stats)
- ✅ Zero API costs (all free tier services)
- ✅ Mobile responsive
- ✅ Dark theme UI

## Need Help?

Check the browser console (F12) for error messages. Most issues are:
1. Missing `.env` file
2. Wrong Supabase credentials
3. Tables not created in Supabase
4. Camera/location permissions denied
