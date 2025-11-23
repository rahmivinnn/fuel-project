# Deploy to GitHub & Vercel

## Step 1: Push to GitHub

Run these commands in terminal:

```bash
cd "c:\Users\Lenovo\Downloads\fuelfriendly (3)"
git init
git add .
git commit -m "Initial commit - FuelFriendly app"
git branch -M main
git remote add origin https://github.com/rahmivinnn/fuel-project.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import from GitHub: `rahmivinnn/fuel-project`
4. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `.`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Add Environment Variables:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyAojjt6CTISq8kWYdifAAjJAnYxIAPsv0E
   VITE_FIREBASE_AUTH_DOMAIN=fuelflow-asi.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=fuelflow-asi
   VITE_FIREBASE_STORAGE_BUCKET=fuelflow-asi.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=292700372185
   VITE_FIREBASE_APP_ID=1:292700372185:web:17b8e2f7e063a73a7652c8
   VITE_GOOGLE_CLIENT_ID=292700372185-4qhu9adcjtdi8to8271havl6m3t7kcs4.apps.googleusercontent.com
   VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoidmluYTk4IiwiYSI6ImNtN3I3eDF6ZTB2OW0yam9kdzFxdndhdTkifQ.HNqbNgBUAoBPYmoAMISdaw
   VITE_GEMINI_API_KEY=AIzaSyC405HqOqtoF2QqeJwABgRaY_MwPjcxNKs
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

6. Click "Deploy"

## Step 3: Setup Twilio WhatsApp (Optional)

1. Sign up at https://www.twilio.com/
2. Get Account SID and Auth Token
3. Activate WhatsApp Sandbox
4. Update environment variables in Vercel with real credentials

Your app will be live at: `https://fuel-project.vercel.app`
