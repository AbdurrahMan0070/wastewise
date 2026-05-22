# 🚀 Deploy to Netlify

## Quick Deploy Steps

### 1. Build the App
```bash
npm run build
```
This creates a `dist` folder with your production build.

### 2. Deploy to Netlify

#### Option A: Drag & Drop (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login
3. Drag the `dist` folder to Netlify
4. Done! ✅

#### Option B: GitHub + Netlify (Recommended)
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub
5. Select your repository
6. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
7. Click "Deploy site"
8. Done! ✅

### 3. Add Environment Variables
In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add your Supabase credentials:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

### 4. Enable HTTPS
Netlify automatically provides HTTPS - no setup needed!

---

## Important Notes

### Camera Access
- Camera barcode scanner requires HTTPS
- Netlify provides HTTPS automatically ✅
- Works on mobile and desktop

### PWA Installation
- PWA works on HTTPS
- Users can install your app on their devices
- Works offline after first visit

### Custom Domain (Optional)
1. Go to Domain settings in Netlify
2. Add your custom domain
3. Netlify handles SSL automatically

---

## Your netlify.toml is Ready!

The `netlify.toml` file is already configured with:
- Build command
- Publish directory
- Redirects for SPA routing
- Headers for security

---

## 🎉 That's It!

Your app will be live at: `https://your-site-name.netlify.app`

**Good luck with your hackathon!** 🏆
