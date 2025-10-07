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
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch affiliate data' });
    }

    const data = await response.json();

    let score = 0;
    const referrals = data?.data?.referrals || [];

    const referralCount = referrals.length;
    const bigOrders = referrals.filter((r: any) => Number(r?.amount) >= 200).length;

    score += referralCount * 5;
    score += bigOrders * 20;

    return res.status(200).json({
      email,
      score,
      details: { referralCount, bigOrders },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
}
