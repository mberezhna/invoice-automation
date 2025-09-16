const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
export { BASE };

export async function fetchInvoicesServer(params = {}) {
  const q = new URLSearchParams(params);
  const res = await fetch(`${BASE}/invoices?${q.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
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

export async function createInvoice(payload) {
  const res = await fetch(`${BASE}/invoices`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to create invoice");
  }
  return res.json();
}

export async function uploadInvoicePdf(id, file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${BASE}/invoices/${id}/upload-pdf`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function deleteInvoicePdf(id) {
  const res = await fetch(`${BASE}/invoices/${id}/pdf`, { method: "DELETE" });
  if (!res.ok) throw new Error("Remove failed");
  return res.json();
}
