export default async function handler(req, res) {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ ok: false, error: "Missing email" });
  }

  try {
    // 调用你原来的接口
    const apiUrl = `https://up-score-api.vercel.app/api/score?email=${encodeURIComponent(email)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // 开启跨域支持
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return res.status(200).json(data);
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
