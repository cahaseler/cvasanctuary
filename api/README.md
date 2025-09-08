# CVAS API Proxy

This is a Vercel Edge Function that proxies requests to the PetStablished API, adding CORS headers to allow browser access.

## Deployment

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   cd api
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy: Yes
   - Which scope: Your personal account
   - Link to existing project: No
   - Project name: cvas-api
   - Directory: ./
   - Override settings: No

4. For production deployment:
   ```bash
   vercel --prod
   ```

## API Endpoint

Once deployed, the API will be available at:
```
https://cvas-api.vercel.app/api/petstablished
```

## Local Development

To test locally:
```bash
cd api
npm install
vercel dev
```

The API will be available at `http://localhost:3000/api/petstablished`