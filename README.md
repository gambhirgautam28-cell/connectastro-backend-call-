# ConnectAstro Backend (Render-ready)

## Files
- `server.js` - Express backend that calls Exotel and receives webhooks.
- `package.json` - Node dependencies and start script.

## How to deploy on Render
1. Go to https://dashboard.render.com and click **New → Web Service**.
2. Choose **"Deploy via Upload"** (Upload folder).
3. Upload the `connectastro-backend` folder (the ZIP provided).
4. Set these Environment Variables in Render (Environment → Environment Variables):
   - `EXOTEL_SID` = your exotel SID
   - `EXOTEL_TOKEN` = your exotel token
   - `EXO_VIRTUAL` = 09513886363
   - `ASTRO_NUMBER` = +919772304245
   - `BACKEND_URL` = https://<your-render-url>   (set after first deploy)
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Deploy. After deploy, copy your service URL and set `BACKEND_URL` to it, then redeploy.
8. Update your Shopify frontend snippet: replace `const backend = "https://YOUR_BACKEND_URL";` with your Render URL.

## Notes
- Do **not** embed Exotel credentials in client-side code.
- For production, rotate Exotel API keys if they've been exposed.
- Save webhook data to a DB if you want recordings persisted.
