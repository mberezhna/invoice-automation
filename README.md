# invoice-automation
GET /invoices 
curl "http://127.0.0.1:5000/invoices?client=Acme&status=unpaid&issue_from=2025-08-01&issue_to=2025-09-30&min_amount=400"
GET /invoices/<id>
curl http://127.0.0.1:5000/invoices/1

POST /invoices (створення)

Поля: invoice_number, client_name, amount, status (unpaid|paid|overdue), issue_date, due_date.
* — обов’язкові.

cURL (Git Bash):

curl -X POST "http://127.0.0.1:5000/invoices" \
  -H "Content-Type: application/json" \
  -d "{\"invoice_number\":\"INV-2025-0004\",\"client_name\":\"Umbrella Ltd\",\"amount\":650.25,\"issue_date\":\"2025-09-01\",\"due_date\":\"2025-09-15\",\"status\":\"unpaid\"}"

PATCH /invoices/<id> (часткове оновлення)

Будь-які з полів: invoice_number, client_name, amount, status, issue_date, due_date.

curl -X PATCH http://127.0.0.1:5000/invoices/1 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"paid\"}"

DELETE /invoices/<id>
curl -X DELETE http://127.0.0.1:5000/invoices/1

POST /invoices/<id>/upload-pdf (завантаження PDF)
curl -X POST "http://127.0.0.1:5000/invoices/1/upload-pdf" \
  -F "file=@/c/Users/User/Projects/invoice-automation/backend/uploads/6.pdf"

GET /invoices/<id>/pdf (віддати PDF)

Відкрий у браузері:

http://127.0.0.1:5000/invoices/1/pdf