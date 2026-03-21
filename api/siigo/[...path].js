export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Partner-Id");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path" });

  const pathStr = Array.isArray(path) ? path.join("/") : path;
  const query = { ...req.query };
  delete query.path;
  const qs = new URLSearchParams(query).toString();
  const full_url = qs
    ? `https://api.siigo.com/${pathStr}?${qs}`
    : `https://api.siigo.com/${pathStr}`;

  const headers = {
    "Content-Type": "application/json",
    "Partner-Id": "JAS-Explorer",
  };

  if (req.headers.authorization) {
    headers["Authorization"] = req.headers.authorization;
  }

  let body = undefined;
  if (req.method !== "GET" && req.method !== "DELETE") {
    if (req.body && typeof req.body === "object") {
      body = JSON.stringify(req.body);
    } else if (typeof req.body === "string" && req.body.length > 0) {
      body = req.body;
    }
  }

  try {
    const response = await fetch(full_url, { method: req.method, headers, ...(body ? { body } : {}) });
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).json({ raw: text, status: response.status });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message, url: full_url });
  }
}export default async function handler(req, res) {
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
