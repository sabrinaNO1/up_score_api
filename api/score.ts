import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: 'Missing email parameter' });
  }

  try {
    const response = await fetch(
      `https://app.uppromote.com/api/v1/affiliates/find-by-email?email=${email}`,
      {
        headers: {
          'X-Access-Token': 'pk_tBC26ce7v33sxa75O51XPpxYifBUfh5j',
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
