# WebSocket Server Deployment Guide

## Deploy to Render (Recommended)

### 1. Create a Git Repository in the `server` folder

```bash
cd server
git init
git add .
git commit -m "Initial WebSocket server"
git remote add origin https://github.com/addlightness/whop-war-websocket.git
git push -u origin main
```

### 2. Deploy on Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your repository
5. Configure:
   - **Name**: `whop-war-websocket`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: Leave empty (WebSocket doesn't need HTTP)
6. Click "Create Web Service"

### 3. Get Your WebSocket URL

Once deployed, your URL will be something like:
- `wss://whop-war-websocket.onrender.com`

### 4. Configure Vercel Environment Variable

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - **Key**: `NEXT_PUBLIC_WEBSOCKET_URL`
   - **Value**: `wss://your-app-name.onrender.com` (use the URL from Render)
4. Redeploy your Vercel app

## Alternative: Deploy to Replit

1. Go to [replit.com](https://replit.com)
2. Create a new "Node.js" repl
3. Upload your `server` folder contents
4. Run `npm install ws`
5. Run `node websocket.js`
6. Get your WebSocket URL from the Replit console

## Alternative: Deploy to Glitch

1. Go to [glitch.com](https://glitch.com)
2. Click "New Project" → "Import from GitHub"
3. Connect your GitHub account
4. Select your repo
5. Run `npm install ws` in the terminal
6. Your WebSocket URL will be available automatically

## Testing

After deployment, test your WebSocket connection:
```javascript
const ws = new WebSocket('wss://your-websocket-url.onrender.com');
ws.onopen = () => console.log('Connected!');
ws.onerror = (err) => console.error('Error:', err);
```

