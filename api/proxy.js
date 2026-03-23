export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { endpoint, ...params } = req.query;
  if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });

  const qs = new URLSearchParams(params).toString();
  const url = qs ? `https://api.siigo.com/${endpoint}?${qs}` : `https://api.siigo.com/${endpoint}`;

  const headers = { "Content-Type": "application/json" };
  if (req.headers.authorization) headers["Authorization"] = req.headers.authorization;

  try {
    const r = await fetch(url, {
      method: req.method, headers,
      ...(req.method === "POST" && req.body ? { body: JSON.stringify(req.body) } : {}),
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
