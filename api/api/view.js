export default async function handler(req, res) {
  const email = req.query.email;

  if (!email) {
    return res.status(400).send(`<div style="font-family:Inter,sans-serif;text-align:center;color:#3A2F1F">
      <p>Please log in to view your Spark Points ✨</p>
    </div>`);
  }

  try {
    const response = await fetch(`https://up-score-api.vercel.app/api/score?email=${encodeURIComponent(email)}`);
    const data = await response.json();

    const score = data.ok ? data.score : "—";

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <div style="font-family:Inter,sans-serif;text-align:center;padding:12px 0;color:#3A2F1F;line-height:1.6;">
        <p style="font-weight:500;">You currently have</p>
        <p style="font-size:22px;font-weight:700;color:#C5A363;">${score} ✨</p>
      </div>
    `);
  } catch (err) {
    res.status(500).send(`<div style="font-family:Inter,sans-serif;text-align:center;color:#3A2F1F">
      <p>⚠️ Error loading points. Please refresh.</p>
    </div>`);
  }
}
