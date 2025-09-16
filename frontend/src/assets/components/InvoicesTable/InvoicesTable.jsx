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
     {
      field: "rowNumber",
      headerName: "#",
      width: 60,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const api = params.api;
        if (typeof api.getRowIndexRelativeToVisibleRows === "function") {
          return api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        }
        if (typeof api.getRowIndex === "function") {
          return api.getRowIndex(params.id) + 1;
        }
        return "";
      },
    },
    { field: "invoice_number", headerName: "Invoice #", flex: 1 },
    { field: "client_name", headerName: "Client", flex: 1 },
    { field: "amount", headerName: "Amount", width: 120, type: "number" },
    { field: "issue_date", headerName: "Issue", width: 120 },
    { field: "due_date", headerName: "Due", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
    {
      field: "pdf_path",
      headerName: "File",
      width: 260,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const id = params.row.id;
        const hasPdf = Boolean(params.value);
        const inputId = `upload-${id}`;

        return (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {hasPdf && (
              <a
                href={`${BASE}/invoices/${id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Open PDF
              </a>
            )}

            <label
              className="btn"
              htmlFor={inputId}
              onClick={(e) => e.stopPropagation()}
            >
              {hasPdf ? "Replace" : "Upload"}
            </label>
            <input
              id={inputId}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                e.stopPropagation();
                const file = e.target.files?.[0];
                if (file) params.row.onUploadPdf?.(file);
                e.target.value = "";
              }}
            />

            {hasPdf && (
              <button
                className="btn danger"
                onClick={(e) => {
                  e.stopPropagation();         
                  params.row.onRemovePdf?.();   
                }}
              >
                Remove
              </button>
            )}
          </div>
        );
      },
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
