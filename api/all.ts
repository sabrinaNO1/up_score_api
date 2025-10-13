import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_BASE = 'https://aff-api.uppromote.com/api/v2';
const API_KEY = process.env.CLIENT_KEY || '你的API_KEY'; // 建议改成环境变量

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1️⃣ 获取所有 Affiliate（分页拉取）
    let page = 1;
    const allAffiliates: any[] = [];

    while (true) {
      const affResp = await fetch(`${API_BASE}/affiliates?page=${page}&limit=100`, {
        headers: {
          Authorization: API_KEY,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const affJson = await affResp.json();
      const list = affJson?.data || [];

      if (list.length === 0) break;
      allAffiliates.push(...list);
      page++;
    }

    // 2️⃣ 对每个 affiliate 获取他们的 referrals 数据并计算分数
    const result: any[] = [];

    for (const affiliate of allAffiliates) {
      try {
        const refResp = await fetch(`${API_BASE}/referrals?affiliate_id=${affiliate.id}`, {
          headers: {
            Authorization: API_KEY,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });

        const refJson = await refResp.json();
        const referrals = Array.isArray(refJson?.data) ? refJson.data : [];

        const referralCount = referrals.length;
        const bigOrders = referrals.filter((r: any) => Number(r.amount) >= 200).length;
        const score = referralCount * 5 + bigOrders * 20;

        result.push({
          email: affiliate.email,
          name: `${affiliate.first_name || ''} ${affiliate.last_name || ''}`.trim(),
          referrals: referralCount,
          fullSetOrders: bigOrders,
          score,
        });
      } catch (err) {
        console.error(`Error fetching referrals for ${affiliate.email}:`, err);
      }
    }

    // 3️⃣ 输出为 JSON
    return res.status(200).json({
      ok: true,
      total_affiliates: result.length,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
}
