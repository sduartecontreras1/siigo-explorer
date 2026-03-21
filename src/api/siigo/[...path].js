export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Partner-Id");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path" });

  const siigo_url = `https://api.siigo.com/${Array.isArray(path) ? path.join("/") : path}`;
  const query = { ...req.query };
  delete query.path;
  const qs = new URLSearchParams(query).toString();
  const full_url = qs ? `${siigo_url}?${qs}` : siigo_url;

  try {
    const response = await fetch(full_url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Partner-Id": "JAS-Explorer",
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
      ...(req.method !== "GET" && req.body ? { body: JSON.stringify(req.body) } : {}),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
