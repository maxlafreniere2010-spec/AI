# FNAF GUESS WHO - NETLIFY DEPLOYMENT GUIDE

## Quick Deployment (5 minutes)

### Step 1: Connect GitHub to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click **Sign up** and choose **GitHub**
3. Authorize Netlify to access your repositories
4. After login, click **Add new site** → **Import an existing project**

### Step 2: Select Your Repository
1. Choose **GitHub** as your Git provider
2. Search for: `maxlafreniere2010-spec/AI`
3. Click the repository to connect

### Step 3: Configure Build Settings
Netlify should auto-detect the settings from `netlify.toml`:
- **Build command:** `echo 'No build needed'`
- **Publish directory:** `.` (root directory)
- **Base directory:** `fnaf-guess-who/`

If these aren't auto-filled:
1. Click **Edit settings**
2. Update the values above
3. Save

### Step 4: Deploy
1. Click **Deploy site**
2. Wait for build to complete (should be instant)
3. Your site is now live! You'll get a URL like: `https://[random-name].netlify.app`

### Step 5: Share the Link
Your game is now accessible to **anyone without GitHub**. Share the link with:
- Friends
- Social media
- Discord
- Anywhere!

---

## Features Fixed in This Update

✅ **Undo/Redo** - Now smoothly scrolls to affected cards when undoing/redoing moves
✅ **Select All** - Board editor SELECT ALL and DESELECT ALL buttons now work
✅ **Button Handlers** - All onclick handlers properly connected to global functions
✅ **Invert Flipped** - Toggle all flipped cards in match mode
✅ **Drag Select in Editor** - Click or drag cards to toggle enabled/disabled state

---

## How to Update After Changes

Every time you make changes locally:
```bash
cd /workspaces/AI/fnaf-guess-who
git add -A
git commit -m "Your commit message"
git push origin main
```

**Netlify will automatically redeploy** within seconds!

---

## Troubleshooting

### Site shows 404 on button clicks
- Check browser console (F12 → Console tab) for errors
- Clear cache: Hard refresh with `Ctrl+Shift+R`

### Changes not appearing
- Wait 30 seconds after pushing - Netlify needs time to build
- Check Netlify dashboard for build status
- Force refresh page in browser

### Custom Domain?
1. In Netlify dashboard, click **Domain settings**
2. Add your custom domain (requires DNS setup)

---

## Live Demo

Once deployed, you can:
- Click the login button and enter a username
- Create/edit custom boards
- Play matches with multiplayer (via PeerJS)
- Undo/Redo your moves (with auto-scroll)
- Use Drag Select in the board editor

Enjoy! 🎮
