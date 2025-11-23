<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1LcOgiAnE9KrmcnTReKW7IrzaTX2pVIZC

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and create a new project
3. Import your GitHub repository
4. Configure the project with the following settings:
   - Framework Preset: `Vite`
   - Root Directory: `.` (current directory)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add the required environment variables in the Vercel project settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_MAPBOX_ACCESS_TOKEN`
   - `GEMINI_API_KEY`
6. Deploy the project

## Region Restriction

This application is configured to work only in the United Kingdom (GB) and United States (US). 
The region restriction is implemented using IP geolocation services that detect the user's country.
If a user attempts to access the app from a restricted region, they will see a region restriction page.

Note: The app is configured to work with Vercel's serverless functions for API endpoints. The backend functionality will be handled automatically through Vercel's API routes.