import { useState } from "react";
import './NewInvoiceForm.scss'

export default function NewInvoiceForm({ open, onCancel, onCreate }) {
  const [form, setForm] = useState({
    invoice_number: "",
    client_name: "",
    amount: "",
    issue_date: "",
    due_date: "",
    status: "unpaid",
  });
 if (!open) return null;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.invoice_number || !form.client_name || !form.amount) {
      alert("invoice_number, client_name, amount — obviously")
      return;
    }
    onCreate({
      ...form,
      amount: Number(form.amount),
      issue_date: form.issue_date || null,
      due_date: form.due_date || null,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>New invoice</h3>
        <form className="edit-form" onSubmit={handleSubmit}>
          <label>
            Invoice #
            <input name="invoice_number" value={form.invoice_number} onChange={onChange} />
          </label>
          <label>
            Client
            <input name="client_name" value={form.client_name} onChange={onChange} />
          </label>
          <label>
            Amount
            <input name="amount" type="number" step="0.01" value={form.amount} onChange={onChange} />
          </label>
          <label>
            Issue date
            <input name="issue_date" type="date" value={form.issue_date} onChange={onChange} />
          </label>
          <label>
            Due date
            <input name="due_date" type="date" value={form.due_date} onChange={onChange} />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={onChange}>
              <option value="unpaid">unpaid</option>
              <option value="paid">paid</option>
              <option value="overdue">overdue</option>
            </select>
          </label>

          <div className="row">
            <button type="button" className="btn" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}