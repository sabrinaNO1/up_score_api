import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ error: 'Missing email parameter' });
  }

  try {
    const url = `https://aff-api.uppromote.com/api/v2/affiliates?affiliate_email=${email}`;
    console.log("Fetching:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'pk_tBC26ce7v33sxa75O51XPpxYifBUfh5j',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const text = await response.text();
    console.log("Raw response:", text);

    try {
      const data = JSON.parse(text);
      return res.status(200).json({ ok: true, data });
    } catch (err) {
      // 如果返回不是 JSON，我们直接把原始内容返回出来看
      return res.status(500).json({ error: 'Invalid JSON returned', raw: text });
    }

  } catch (error: any) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
