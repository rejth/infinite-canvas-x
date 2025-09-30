/**
 * Serverless Function: Fetch Photos from Unsplash API
 *
 * This is a Vercel serverless function that securely calls the Unsplash API to fetch stock photos.
 *
 * Setup Instructions:
 * 1. Get your Unsplash Access Key:
 *    - Go to https://unsplash.com/developers
 *    - Create a new application or use an existing one
 *    - Copy your "Access Key"
 *
 * 2. Add the API key to your Vercel project:
 *    - Go to your Vercel dashboard (vercel.com)
 *    - Select your project → Settings → Environment Variables
 *    - Add: Name: UNSPLASH_API_KEY, Value: your_access_key
 *    - Make sure to check Production, Preview, and Development environments
 *    - Redeploy your project after adding the environment variable
 *
 * 3. This function will be available at: /api/photos
 *
 * 4. For the local development run:
 * - `npm install -g vercel`
 * - `vercel dev`
 *
 * The function will be available at: http://localhost:3000/api/photos
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get Unsplash API key from environment variables
  // This must be set in Vercel project settings
  const apiKey = process.env.UNSPLASH_API_KEY;

  if (!apiKey) {
    console.error('UNSPLASH_API_KEY is not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(`https://api.unsplash.com/photos/?client_id=${apiKey}`);

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
}
