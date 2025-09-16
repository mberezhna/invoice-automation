import { useEffect, useMemo, useState, useCallback } from "react";
import InvoicesTable from "./assets/components/InvoicesTable/InvoicesTable.jsx";
import EditInvoiceForm from "./assets/components/EditInvoiceForm/EditInvoiceForm.jsx";
import NewInvoiceForm from "./assets/components/NewInvoiceForm/NewInvoiceForm.jsx";
import {
  fetchInvoicesServer,
  updateInvoice,
  createInvoice,
  uploadInvoicePdf,
  deleteInvoicePdf,
  BASE
} from "./assets/utils/fetchInvoices";
import "./App.scss";

export default function App() {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState([]);
  const [filters, setFilters] = useState({ client: "", status: "" });

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);

  const query = useMemo(() => {
    const q = { page: paginationModel.page + 1, limit: paginationModel.pageSize };
    if (sortModel[0]) { q.sort = sortModel[0].field; q.order = sortModel[0].sort || "asc"; }
    if (filters.client) q.client = filters.client;
    if (filters.status) q.status = filters.status;
    return q;
  }, [paginationModel, sortModel, filters]);

  const enrichRows = useCallback((items) =>
    items.map(r => ({
      ...r,
      onUploadPdf: async (file) => {
        if (!file) return;
        try {
          const updated = await uploadInvoicePdf(r.id, file);
          setRows(prev => prev.map(x =>
            x.id === r.id
              ? { ...updated, onUploadPdf: x.onUploadPdf, onRemovePdf: x.onRemovePdf }
              : x
          ));
        } catch (e) {
          alert(e.message || "Upload failed");
        }
      },
      onRemovePdf: async () => {
        if (!confirm("Remove PDF from this invoice?")) return;
        try {
          const updated = await deleteInvoicePdf(r.id);
          setRows(prev => prev.map(x =>
            x.id === r.id
              ? { ...updated, onUploadPdf: x.onUploadPdf, onRemovePdf: x.onRemovePdf }
              : x
          ));
        } catch (e) {
          alert(e.message || "Remove failed");
        }
      }
    }))
  , []);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchInvoicesServer(query)
      .then(({ items, total }) => {
        setRows(enrichRows(items));
        setRowCount(total);
      })
      .finally(() => setLoading(false));
  }, [query, enrichRows]);

  useEffect(() => { refetch(); }, [refetch]);

  const handleEdit = (row) => { setEditRow(row); setEditOpen(true); };

  const handleSave = async (patch) => {
    try {
      await updateInvoice(editRow.id, patch);
      setEditOpen(false);
      setEditRow(null);
      refetch();
    } catch (e) {
      alert(e.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this invoice?")) return;
    const res = await fetch(`${BASE}/invoices/${id}`, { method: "DELETE" });
    if (res.ok) {
      refetch();
    } else {
      alert("Delete failed");
    }
  };

  const handleCreate = async (payload) => {
    try {
      await createInvoice(payload);
      setCreateOpen(false);
      refetch();
    } catch (e) {
      alert(e.message || "Create failed");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "32px auto", padding: 16 }}>
      <h1>Invoices</h1>

      <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
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

        <button className="btn primary" onClick={() => setCreateOpen(true)}>
          + New invoice
        </button>
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

      <NewInvoiceForm
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
