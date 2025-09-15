import { useEffect, useMemo, useState } from "react";
import InvoicesTable from "./assets/components/InvoicesTable/InvoicesTable.jsx";
import EditInvoiceForm from "./assets/components/EditInvoiceForm/EditInvoiceForm.jsx";
import { fetchInvoicesServer, updateInvoice, BASE  } from "./assets/utils/fetchInvoices";
import"./App.scss";

export default function App() {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState([]);

  const [filters, setFilters] = useState({ client: "", status: "" });

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const query = useMemo(() => {
    const q = { page: paginationModel.page + 1, limit: paginationModel.pageSize };
    if (sortModel[0]) { q.sort = sortModel[0].field; q.order = sortModel[0].sort || "asc"; }
    if (filters.client) q.client = filters.client;
    if (filters.status) q.status = filters.status;
    return q;
  }, [paginationModel, sortModel, filters]);

  useEffect(() => {
    setLoading(true);
    fetchInvoicesServer(query)
      .then(({ items, total }) => { setRows(items); setRowCount(total); })
      .finally(() => setLoading(false));
  }, [query]);

  const handleEdit = (row) => { setEditRow(row); setEditOpen(true); };
  const handleSave = async (patch) => {
    try {
      const updated = await updateInvoice(editRow.id, patch);
      setRows(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      setEditOpen(false);
      setEditRow(null);
    } catch (e) {
      alert(e.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this invoice?")) return;
    const res = await fetch(`${BASE}/invoices/${id}`, { method: "DELETE" });
    if (res.ok) setRows(prev => prev.filter(r => r.id !== id));
    else alert("Delete failed");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "32px auto", padding: 16 }}>
      <h1>Invoices</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <input
          placeholder="Client…"
          value={filters.client}
          onChange={(e) => setFilters(f => ({ ...f, client: e.target.value }))}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <InvoicesTable
        rows={rows}
        rowCount={rowCount}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditInvoiceForm
        open={editOpen}
        invoice={editRow}
        onCancel={() => { setEditOpen(false); setEditRow(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
