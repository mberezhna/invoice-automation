const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
export { BASE };

export async function fetchInvoicesServer(params = {}) {
  const q = new URLSearchParams(params);
  const res = await fetch(`${BASE}/invoices?${q.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json(); // { items, total, page, limit }
}

export async function updateInvoice(id, patch) {
  const res = await fetch(`${BASE}/invoices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update invoice");
  return res.json();
}
