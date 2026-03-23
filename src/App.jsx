import { useState } from "react";

const C = {
  yellow: "#F5C518", amber: "#F0A030", black: "#1A1A1A",
  gray: "#4A4A4A", muted: "#8A8A8A", border: "#F0E4B8",
  bgLight: "#FFFBF0", bgCard: "#FFFFFF", bgPage: "#F7F5F0",
  green: "#16a34a", greenBg: "#f0fdf4", greenBorder: "#bbf7d0",
  red: "#dc2626", redBg: "#fef2f2", redBorder: "#fecaca",
  blue: "#2563eb", blueBg: "#eff6ff", blueBorder: "#bfdbfe",
};

async function siigo(method, path, token, body, params) {
  console.log("DEBUG token recibido:", token);
  console.log("DEBUG endpoint:", path);
  console.log("DEBUG body:", body);
  console.log("DEBUG params:", params);

  const p = new URLSearchParams({ endpoint: path, ...(params || {}) }).toString();
  const url = `/api/proxy?${p}`;

  console.log("DEBUG url final:", url);

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();

  console.log("DEBUG status:", res.status);
  console.log("DEBUG respuesta completa:", data);

  return { ok: res.ok, status: res.status, data };
}

function JASLogo() {
  return (
    <svg width="140" height="32" viewBox="0 0 140 36" fill="none">
      <circle cx="8" cy="28" r="5" fill="#F0A030"/>
      <rect x="17" y="16" width="8" height="18" rx="4" fill="#F0A030"/>
      <rect x="29" y="6" width="8" height="28" rx="4" fill="#F5C518"/>
      <text x="42" y="22" fontFamily="'Nunito',sans-serif" fontWeight="700" fontSize="18" fill="#1A1A1A" letterSpacing="2">JAS</text>
      <text x="42" y="32" fontFamily="'Nunito',sans-serif" fontWeight="300" fontSize="8" fill="#4A4A4A">Explorador Siigo API</text>
    </svg>
  );
}

function Card({ title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: C.bgLight, border: "none", cursor: "pointer", fontFamily: "'Nunito',sans-serif", textAlign: "left" }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.black }}>{title}</span>
          {subtitle && <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>{subtitle}</span>}
        </div>
        <span style={{ color: C.muted, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div style={{ padding: "14px 16px", background: C.bgCard }}>{children}</div>}
    </div>
  );
}

function Row({ label, hint, badge, onQuery, loading }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.black }}>{label}</p>
        {hint && <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{hint}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {badge}
        <button onClick={onQuery} disabled={loading} style={{ padding: "7px 14px", fontSize: 12, fontWeight: 700, background: loading ? "#e5e7eb" : C.yellow, color: loading ? C.muted : C.black, border: "none", borderRadius: 7, cursor: loading ? "default" : "pointer", fontFamily: "'Nunito',sans-serif" }}>
          {loading ? "..." : "Consultar"}
        </button>
      </div>
    </div>
  );
}

function Badge({ ok }) {
  return ok === null ? null : ok
    ? <span style={{ background: C.greenBg, color: C.green, border: `1px solid ${C.greenBorder}`, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>✓ OK</span>
    : <span style={{ background: C.redBg, color: C.red, border: `1px solid ${C.redBorder}`, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>✗ Error</span>;
}

function Result({ data }) {
  if (!data) return null;
  return <pre style={{ background: "#1e1e2e", color: "#cdd6f4", padding: "14px 16px", borderRadius: 10, fontSize: 11, overflowX: "auto", lineHeight: 1.6, margin: "10px 0 0", maxHeight: 280, overflowY: "auto", fontFamily: "monospace" }}>{JSON.stringify(data, null, 2)}</pre>;
}

const inputSt = { padding: "9px 12px", fontSize: 13, border: `1.5px solid ${C.border}`, borderRadius: 8, fontFamily: "'Nunito',sans-serif", fontWeight: 300, outline: "none", width: "100%", boxSizing: "border-box" };

export default function App() {
  const [creds, setCreds] = useState({ username: "", access_key: "" });
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState(null);
  const [fechas, setFechas] = useState({ inicio: "", fin: "" });
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");

  async function autenticar() {
    if (!creds.username || !creds.access_key) return;

    console.log("DEBUG credenciales enviadas:", {
      username: creds.username,
      access_key_viene: !!creds.access_key,
      access_key_largo: creds.access_key?.length || 0,
    });

    setAuthLoading(true);
    setAuthMsg(null);

    try {
      const r = await siigo("POST", "auth", null, {
        username: creds.username,
        access_key: creds.access_key
      });

      console.log("DEBUG resultado autenticar:", r);

      if (r.data?.access_token) {
        setToken(r.data.access_token);
        setAuthMsg({ ok: true, text: "✓ Conexión exitosa. Token válido por 24 horas." });
        setFechas({ inicio: `${y}-${m}-01`, fin: `${y}-${m}-${String(new Date(y, now.getMonth() + 1, 0).getDate()).padStart(2, "0")}` });
      } else {
        const msg =
          r.data?.Errors?.[0]?.Message ||
          r.data?.message ||
          r.data?.error ||
          JSON.stringify(r.data);

        setAuthMsg({ ok: false, text: msg });
      }
    } catch (e) {
      console.log("DEBUG error autenticar catch:", e);
      setAuthMsg({ ok: false, text: e.message });
    }

    setAuthLoading(false);
  }

  async function consultar(key, path, params) {
    if (!token) {
      console.log("DEBUG consultar cancelado: no hay token");
      return;
    }

    setLoading(l => ({ ...l, [key]: true }));

    try {
      const r = await siigo("GET", path, token, null, params);
      console.log(`DEBUG resultado consulta ${key}:`, r);
      setResults(prev => ({ ...prev, [key]: r }));
    } catch (e) {
      console.log(`DEBUG error consulta ${key}:`, e);
      setResults(prev => ({ ...prev, [key]: { ok: false, status: 0, data: { error: e.message } } }));
    }

    setLoading(l => ({ ...l, [key]: false }));
  }

  function filtros() {
  const p = { page: 0, page_size: 25 };
  if (fechas.inicio) p.created_start = fechas.inicio;
  if (fechas.fin) p.created_end = fechas.fin;
  return p;
}
  return (
    <div style={{ minHeight: "100vh", background: C.bgPage, fontFamily: "'Nunito',sans-serif", fontWeight: 300, padding: "0 1rem 4rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        <div style={{ background: C.bgLight, border: `1px solid ${C.border}`, padding: "12px 20px", borderRadius: "0 0 16px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(245,197,24,0.08)" }}>
          <JASLogo/>
          {token && <span style={{ background: C.greenBg, color: C.green, border: `1px solid ${C.greenBorder}`, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>● Conectado a Siigo</span>}
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg,${C.amber},${C.yellow},${C.amber})`, borderRadius: 2, margin: "0 0 20px" }}/>

        <div style={{ background: C.blueBg, border: `1px solid ${C.blueBorder}`, borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: C.blue }}>
          <strong>Privacidad:</strong> Las credenciales se envían directamente a Siigo a través de un proxy seguro. No se almacenan en ningún lado.
        </div>

        <Card title="Paso 1 — Autenticación" subtitle="Ingresa tus credenciales de IW" defaultOpen={true}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Usuario API (correo)</label>
              <input type="email" value={creds.username} onChange={e => setCreds(c => ({ ...c, username: e.target.value }))} placeholder="usuario@empresa.com" style={inputSt}/>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Access Key</label>
              <input type="password" value={creds.access_key} onChange={e => setCreds(c => ({ ...c, access_key: e.target.value }))} placeholder="Tu access key de Siigo" onKeyDown={e => e.key === "Enter" && autenticar()} style={inputSt}/>
            </div>
          </div>

          <button onClick={autenticar} disabled={authLoading || !creds.username || !creds.access_key} style={{ padding: "10px 24px", fontSize: 13, fontWeight: 700, background: C.yellow, color: C.black, border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'Nunito',sans-serif" }}>
            {authLoading ? "Conectando..." : "Conectar con Siigo"}
          </button>

          {authMsg && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: authMsg.ok ? C.greenBg : C.redBg, border: `1px solid ${authMsg.ok ? C.greenBorder : C.redBorder}`, borderRadius: 8, fontSize: 12, color: authMsg.ok ? C.green : C.red, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {authMsg.text}
            </div>
          )}
        </Card>

        {token && (
          <>
            <Card title="Parámetros de consulta" subtitle="Filtra por fecha" defaultOpen={true}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Fecha inicio</label>
                  <input type="date" value={fechas.inicio} onChange={e => setFechas(f => ({ ...f, inicio: e.target.value }))} style={inputSt}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4 }}>Fecha fin</label>
                  <input type="date" value={fechas.fin} onChange={e => setFechas(f => ({ ...f, fin: e.target.value }))} style={inputSt}/>
                </div>
              </div>
            </Card>

            <Card title="Catálogos base" subtitle="Configuración del sistema">
              {[
                ["doc_types", "Tipos de comprobante", "Lista todos los comprobantes (FV, RCB, CE...)", "v1/document-types", { type: "FV" }],
                ["users", "Usuarios del sistema", "Usuarios registrados en Siigo", "v1/users", null],
                ["taxes", "Impuestos configurados", "Retenciones, IVA, ICA", "v1/taxes", null],
                ["payment_types", "Formas de pago", "Medios de pago disponibles", "v1/payment-types", { document_type: "FV" }],
              ].map(([k, label, hint, path, params]) => (
                <div key={k}>
                  <Row label={label} hint={hint} badge={results[k] ? <Badge ok={results[k].ok}/> : null} onQuery={() => consultar(k, path, params)} loading={loading[k]}/>
                  <Result data={results[k]?.data}/>
                </div>
              ))}
            </Card>

            <Card title="Facturas y comprobantes" subtitle="Clave para el checklist">
              {[
                ["purchases", "Facturas de compra", "Verifica procesamiento del periodo en Siigo", "v1/purchases"],
                ["invoices", "Facturas de venta", "Facturas emitidas en el periodo", "v1/invoices"],
                ["receipts", "Recibos de caja", "Validación contra extractos bancarios", "v1/vouchers"],
                ["journals", "Comprobantes de diario", "Ajustes, causaciones manuales, cierres", "v1/journals"],
              ].map(([k, label, hint, path]) => (
                <div key={k}>
                  <Row label={label} hint={hint} badge={results[k] ? <Badge ok={results[k].ok}/> : null} onQuery={() => consultar(k, path, filtros())}
loading={loading[k]}/>
                  <Result data={results[k]?.data}/>
                </div>
              ))}
            </Card>

            <Card title="Nómina y terceros">
  {[
    //["employees", "Empleados", "Lista de empleados registrados", "v1/employees", { page: 0, page_size: 25 }],
    ["customers", "Clientes / proveedores", "Terceros registrados en Siigo", "v1/customers", null],
    ["products", "Productos / inventario", "Para conciliación vs Kardex", "v1/products", { page: 0, page_size: 25 }],
  ].map(([k, label, hint, path, params]) => (
    <div key={k}>
      <Row
        label={label}
        hint={hint}
        badge={results[k] ? <Badge ok={results[k].ok}/> : null}
        onQuery={() =>
          consultar(
            k,
            path,
            ["customers", "invoices", "purchases", "receipts", "journals"].includes(k)
              ? filtros()
              : params
          )
        }
        loading={loading[k]}
      />
      <Result data={results[k]?.data}/>
    </div>
  ))}
</Card>

            {Object.keys(results).length > 0 && (
              <div style={{ padding: 16, background: C.bgLight, border: `1px solid ${C.border}`, borderRadius: 12, marginTop: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.black, margin: "0 0 10px" }}>Resumen de consultas</p>
                {Object.entries(results).map(([k, r]) => {
                  const count = r.data?.results?.length ?? (Array.isArray(r.data) ? r.data.length : null);
                  return (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 }}>
                      <span style={{ color: C.gray }}>{k}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ color: C.muted }}>HTTP {r.status}</span>
                        <Badge ok={r.ok}/>
                        {count !== null && <span style={{ color: C.muted }}>{count} registros</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {!token && (
          <p style={{ textAlign: "center", padding: "3rem", color: C.muted, fontSize: 13 }}>Ingresa tus credenciales arriba para conectarte a Siigo.</p>
        )}
      </div>
    </div>
  );
}
