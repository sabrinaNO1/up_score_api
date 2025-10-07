import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ error: 'Missing email parameter' });
  }

  try {
    const response = await fetch(
      `https://app.uppromote.com/api/v1/affiliates/find-by-email?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'X-Access-Token': 'pk_tBC26ce7v33sxa75O51XPpxYifBUfh5j',
          'Content-Type': 'application/json'
        }
      }
    );

    const text = await response.text(); // 先读取纯文本
    try {
      const data = JSON.parse(text); // 尝试解析 JSON
      return res.status(200).json(data);
    } catch (err) {
      // 如果不是 JSON，返回原始内容
      return res.status(500).json({ error: 'Invalid JSON returned', raw: text });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
