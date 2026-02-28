<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/000481c8-2427-413d-8ad9-b99453089173

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file (it is gitignored) and add your Gemini key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```
   The `NEXT_PUBLIC_` prefix is required because the key is read in a
   client-side component. It also prevents build-time errors when building
   the project without an API key defined.
3. Run the app:
   `npm run dev`

## Deploying on Vercel

1. Push your repository to GitHub (or another supported Git provider).
2. Import the project into [Vercel](https://vercel.com).
3. In the Vercel dashboard, set the environment variable:
   `NEXT_PUBLIC_GEMINI_API_KEY` with your Gemini API key.
   This value will be exposed to the browser and is required for the
   client-side editor to function.
4. Vercel will automatically run `npm run build` during deployment. The
   build should succeed thanks to the client‑only editor component.
