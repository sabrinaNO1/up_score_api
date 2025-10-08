import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://aff-api.uppromote.com/api/v2';
const API_KEY = process.env.CLIENT_KEY || '你的API_KEY'; // 建议用环境变量

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const email = (req.query.email as string || '').trim();
  if (!email) return res.status(400).json({ error: 'Missing email parameter' });

  try {
    // 1) 通过邮箱找联盟客
    const affResp = await fetch(`${API_BASE}/affiliates?affiliate_email=${encodeURIComponent(email)}`, {
      headers: {
        Authorization: API_KEY,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const affText = await affResp.text();
    const affJson = JSON.parse(affText);

    const affiliate = Array.isArray(affJson?.data) ? affJson.data[0] : null;
    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate not found for this email' });
    }

    // 2) 查该联盟客的推荐/订单列表（在文档的 Referral → Get list referrals）
    // 该接口路径是 /api/v2/referrals，用 affiliate_id 作为查询参数
    const refResp = await fetch(`${API_BASE}/referrals?affiliate_id=${affiliate.id}`, {
      headers: {
        Authorization: API_KEY,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    const refText = await refResp.text();
    const refJson = JSON.parse(refText);
    const referrals = Array.isArray(refJson?.data) ? refJson.data : [];

    // 3) 计算分数（示例：每条推荐 5 分；金额≥200 的订单 +20 分）
    const referralCount = referrals.length;
    const bigOrders = referrals.filter((r: any) => Number(r.amount) >= 200).length;

    const score = referralCount * 5 + bigOrders * 20;

    return res.status(200).json({
      ok: true,
      email,
      affiliate_id: affiliate.id,
      score,
      details: { referralCount, bigOrders },
      rawAffiliate: affiliate,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}
