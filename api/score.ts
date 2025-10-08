import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: 'Missing email parameter' });
  }

  try {
    const response = await fetch(
      `https://aff-api.uppromote.com/api/v2/affiliates?affiliate_email=${email}`,
      {
        method: 'GET',
        headers: {
          'Authorization': 'pk_tBC26ce7v33sxa75O51XPpxYifBUfh5j',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    const text = await response.text(); // 先用 text()，防止 JSON 解析出错
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: 'Invalid JSON returned', raw: text });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
