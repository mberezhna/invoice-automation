import { DataGrid } from "@mui/x-data-grid";
import { BASE } from "../../utils/fetchInvoices";
import "./InvoicesTable.scss";

export default function InvoicesTable({
  rows = [],
  rowCount,
  loading,
  paginationModel, onPaginationModelChange,
  sortModel, onSortModelChange,
  onEdit, onDelete
}) {
  const columns = [
    { field: "id", headerName: "ID", width: 60 },
    { field: "invoice_number", headerName: "Invoice #", flex: 1 },
    { field: "client_name", headerName: "Client", flex: 1 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "issue_date", headerName: "Issue", width: 120 },
    { field: "due_date", headerName: "Due", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "pdf_path",
      headerName: "File",
      width: 130,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.value ? (
          <a href={`${BASE}/invoices/${params.row.id}/pdf`} target="_blank" rel="noopener noreferrer">
            Open PDF
          </a>
        ) : "—"
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn_adit" onClick={() => onEdit(params.row)}>Edit</button>
          <button className="btn danger" onClick={() => onDelete(params.row.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="tablet">
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={rowCount}
        paginationMode={paginationModel ? "server" : "client"}
        sortingMode={sortModel ? "server" : "client"}
        pageSizeOptions={[10, 25, 50]}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        disableRowSelectionOnClick
      />
    </div>
  );
}
