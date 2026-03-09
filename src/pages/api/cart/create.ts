// selsa-frontend/src/pages/api/cart/create.ts

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Proxy handler to create a guest cart from the frontend.
 * Forwards request to Django backend `/api/cart/create/`.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'; // Set this in .env.local
    const response = await fetch(`${backendUrl}/api/cart/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: req.headers.cookie || '', // Forward cookies to keep session
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to create guest cart:', data);
      return res.status(response.status).json({ error: data?.message || 'Failed to create guest cart' });
    }

    if (!data?.id) {
      console.warn('⚠️ Guest cart created but no ID returned:', data);
      return res.status(500).json({ error: 'No cart ID returned from backend' });
    }

    return res.status(200).json({ id: data.id });
  } catch (error: any) {
    console.error('❌ API error while creating guest cart:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
