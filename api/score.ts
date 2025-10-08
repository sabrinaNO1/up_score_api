import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://aff-api.uppromote.com/api/v2';
const API_KEY = process.env.CLIENT_KEY || '你的API_KEY'; // 建议改成环境变量

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ✅ 设置 CORS，允许 Shopify 页面访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // ✅ 提前处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const email = (req.query.email as string || '').trim();
  if (!email) {
    return res.status(400).json({ error: 'Missing email parameter' });
  }

  try {
    // 1️⃣ 获取联盟客信息
    const affResp = await fetch(`${API_BASE}/affiliates?affiliate_email=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: API_KEY,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const affJson = await affResp.json();
    const affiliate = Array.isArray(affJson?.data) ? affJson.data[0] : null;

    if (!affiliate) {
      return res.status(200).json({
        ok: true,
        email,
        score: 0,
        message: 'No affiliate found for this email',
      });
    }

    // 2️⃣ 获取推荐数据
    const refResp = await fetch(`${API_BASE}/referrals?affiliate_id=${affiliate.id}`, {
      headers: {
        Authorization: API_KEY,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const refJson = await refResp.json();
    const referrals = Array.isArray(refJson?.data) ? refJson.data : [];

    // 3️⃣ 计算积分
    const referralCount = referrals.length;
    const bigOrders = referrals.filter((r: any) => Number(r.amount) >= 200).length;
    const score = referralCount * 5 + bigOrders * 20;

    // ✅ 成功返回
    return res.status(200).json({
      ok: true,
      email,
      affiliate_id: affiliate.id,
      score,
      details: { referralCount, bigOrders },
    });
  } catch (err: any) {
    console.error('Error:', err);
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Internal server error',
    });
  }
}
