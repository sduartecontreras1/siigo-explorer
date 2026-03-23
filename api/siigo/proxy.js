export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { endpoint, ...params } = req.query;
    if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });

    const qs = new URLSearchParams(params).toString();
    const url = qs
      ? `https://api.siigo.com/${endpoint}?${qs}`
      : `https://api.siigo.com/${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      "Partner-Id": "JAS-Explorer",
    };
    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    const fetchOptions = { method: req.method, headers };
    if (req.method === "POST" && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const r = await fetch(url, fetchOptions);
    let data;
    try {
      data = await r.json();
    } catch {
      const text = await r.text();
      data = { raw: text };
    }
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
