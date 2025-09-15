import { useEffect, useMemo, useState } from "react";
import './editInvoiceForm.scss';

const FIELD_OPTIONS = [
  { value: "invoice_number", label: "Invoice #" },
  { value: "client_name",    label: "Client" },
  { value: "amount",         label: "Amount" },
  { value: "status",         label: "Status" },
  { value: "issue_date",     label: "Issue date" },
  { value: "due_date",       label: "Due date" },
];

export default function EditInvoiceForm({ open, invoice, onCancel, onSave }) {
  const [field, setField] = useState("status");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!invoice) return;
    setField("status");
    setValue(invoice.status ?? "");
  }, [invoice]);

  const isDate = field === "issue_date" || field === "due_date";
  const isStatus = field === "status";
  const isAmount = field === "amount";

  const title = useMemo(
    () => (invoice ? `Edit invoice #${invoice.id}` : "Edit invoice"),
    [invoice]
  );

  if (!open || !invoice) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    let patch = {};
    if (isAmount) patch[field] = Number(value);
    else patch[field] = value === "" ? null : value;
    onSave(patch);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{title}</h3>

        <form onSubmit={handleSubmit} className="edit-form">
          <label>
            Field
            <select value={field} onChange={(e) => {
              const f = e.target.value;
              setField(f);
              setValue(invoice?.[f] ?? "");
            }}>
              {FIELD_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          <label>
            New value
            {isStatus ? (
              <select value={value} onChange={(e)=>setValue(e.target.value)}>
                <option value="unpaid">unpaid</option>
                <option value="paid">paid</option>
                <option value="overdue">overdue</option>
              </select>
            ) : isDate ? (
              <input type="date" value={value || ""} onChange={(e)=>setValue(e.target.value)} />
            ) : isAmount ? (
              <input type="number" step="0.01" value={value} onChange={(e)=>setValue(e.target.value)} />
            ) : (
              <input type="text" value={value || ""} onChange={(e)=>setValue(e.target.value)} />
            )}
          </label>

          <div className="row">
            <button type="button" className="btn" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
