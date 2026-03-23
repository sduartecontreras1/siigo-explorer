async function siigo(method, path, token, body, params) {
  const p = new URLSearchParams({ endpoint: path, ...(params || {}) }).toString();
  const res = await fetch(`/api/siigo/proxy?${p}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { ok: res.ok, status: res.status, data: await res.json() };
}
