from flask import Flask, request, send_from_directory
from datetime import date, datetime
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
from sqlalchemy import asc, desc

from db import SessionLocal, init_db, Invoice

app = Flask(__name__)
CORS(app)
init_db()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

_seed_done = False


def serialize(i: Invoice) -> dict:
    return {
        "id": i.id,
        "invoice_number": i.invoice_number,
        "client_name": i.client_name,
        "amount": i.amount,
        "issue_date": i.issue_date.isoformat() if i.issue_date else None,
        "due_date": i.due_date.isoformat() if i.due_date else None,
        "status": i.status,
        "pdf_path": i.pdf_path,
    }


@app.route("/")
def home():
    return {"message": "Hello from Flask!"}


@app.route("/invoices", methods=["GET"])
def get_invoices():
    session = SessionLocal()
    try:
        q = session.query(Invoice)

        inv_no = request.args.get("invoice_number")
        client = request.args.get("client")
        status = request.args.get("status")
        issue_from = request.args.get("issue_from")
        issue_to   = request.args.get("issue_to")
        min_amount = request.args.get("min_amount")
        max_amount = request.args.get("max_amount")

        if inv_no:
            q = q.filter(Invoice.invoice_number.ilike(f"%{inv_no}%"))
        if client:
            q = q.filter(Invoice.client_name.ilike(f"%{client}%"))
        if status:
            q = q.filter(Invoice.status == status)
        if issue_from:
            try:
                q = q.filter(Invoice.issue_date >= datetime.fromisoformat(issue_from).date())
            except ValueError:
                return {"error": "issue_from must be YYYY-MM-DD"}, 400
        if issue_to:
            try:
                q = q.filter(Invoice.issue_date <= datetime.fromisoformat(issue_to).date())
            except ValueError:
                return {"error": "issue_to must be YYYY-MM-DD"}, 400
        if min_amount:
            try:
                q = q.filter(Invoice.amount >= float(min_amount))
            except ValueError:
                return {"error": "min_amount must be a number"}, 400
        if max_amount:
            try:
                q = q.filter(Invoice.amount <= float(max_amount))
            except ValueError:
                return {"error": "max_amount must be a number"}, 400

        total = q.count()

        sort  = request.args.get("sort", "id")
        order = request.args.get("order", "asc")
        allowed = {
            "id": Invoice.id,
            "invoice_number": Invoice.invoice_number,
            "client_name": Invoice.client_name,
            "amount": Invoice.amount,
            "issue_date": Invoice.issue_date,
            "due_date": Invoice.due_date,
            "status": Invoice.status,
        }
        col = allowed.get(sort, Invoice.id)
        q = q.order_by(asc(col) if order != "desc" else desc(col))

        try:
            page  = max(1, int(request.args.get("page", 1)))
            limit = int(request.args.get("limit", 10))
        except ValueError:
            return {"error": "page/limit must be integers"}, 400
        limit  = max(1, min(limit, 100))
        offset = (page - 1) * limit

        items = q.offset(offset).limit(limit).all()

        return {"items": [serialize(i) for i in items], "total": total, "page": page, "limit": limit}
    finally:
        session.close()


@app.route("/invoices/<int:invoice_id>", methods=["GET"])
def get_invoice(invoice_id: int):
    session = SessionLocal()
    try:
        inv = session.get(Invoice, invoice_id)
        if not inv:
            return {"error": "Invoice not found"}, 404
        return serialize(inv)
    finally:
        session.close()


@app.route("/invoices", methods=["POST"])
def create_invoice():
    data = request.get_json(silent=True) or {}
    required = ["invoice_number", "client_name", "amount", "status"]
    missing = [k for k in required if k not in data]
    if missing:
        return {"error": f"Missing fields: {', '.join(missing)}"}, 400

    issue_date = None
    due_date   = None
    if data.get("issue_date"):
        try:
            issue_date = datetime.fromisoformat(data["issue_date"]).date()
        except ValueError:
            return {"error": "issue_date must be YYYY-MM-DD"}, 400
    if data.get("due_date"):
        try:
            due_date = datetime.fromisoformat(data["due_date"]).date()
        except ValueError:
            return {"error": "due_date must be YYYY-MM-DD"}, 400

    allowed_status = {"unpaid", "paid", "overdue"}
    if data["status"] not in allowed_status:
        return {"error": f"Invalid status. Allowed: {', '.join(sorted(allowed_status))}"}, 400

    session = SessionLocal()
    try:
        inv = Invoice(
            invoice_number=data["invoice_number"],
            client_name=data["client_name"],
            amount=float(data["amount"]),
            issue_date=issue_date,
            due_date=due_date,
            status=data["status"],
            pdf_path=None,
        )
        session.add(inv)
        session.commit()
        session.refresh(inv)
        return serialize(inv), 201
    finally:
        session.close()


@app.route("/invoices/<int:invoice_id>", methods=["PATCH"])
def update_invoice(invoice_id: int):
    data = request.get_json(silent=True) or {}
    session = SessionLocal()
    try:
        inv = session.get(Invoice, invoice_id)
        if not inv:
            return {"error": "Invoice not found"}, 404

        if "invoice_number" in data:
            inv.invoice_number = data["invoice_number"]
        if "client_name" in data:
            inv.client_name = data["client_name"]
        if "amount" in data:
            inv.amount = float(data["amount"])
        if "status" in data:
            allowed = {"unpaid", "paid", "overdue"}
            if data["status"] not in allowed:
                return {"error": f"Invalid status. Allowed: {', '.join(sorted(allowed))}"}, 400
            inv.status = data["status"]

        if "issue_date" in data:
            if data["issue_date"] is None:
                inv.issue_date = None
            else:
                try:
                    inv.issue_date = datetime.fromisoformat(data["issue_date"]).date()
                except ValueError:
                    return {"error": "issue_date must be YYYY-MM-DD"}, 400

        if "due_date" in data:
            if data["due_date"] is None:
                inv.due_date = None
            else:
                try:
                    inv.due_date = datetime.fromisoformat(data["due_date"]).date()
                except ValueError:
                    return {"error": "due_date must be YYYY-MM-DD"}, 400

        session.commit()
        session.refresh(inv)
        return serialize(inv)
    finally:
        session.close()


@app.route("/invoices/<int:invoice_id>", methods=["DELETE"])
def delete_invoice(invoice_id: int):
    session = SessionLocal()
    try:
        inv = session.get(Invoice, invoice_id)
        if not inv:
            return {"error": "Invoice not found"}, 404

        if inv.pdf_path:
            try:
                os.remove(os.path.join(os.path.dirname(__file__), inv.pdf_path))
            except FileNotFoundError:
                pass

        session.delete(inv)
        session.commit()
        return {"message": f"Invoice {invoice_id} deleted"}
    finally:
        session.close()

@app.route("/invoices/<int:invoice_id>/upload-pdf", methods=["POST"])
def upload_invoice_pdf(invoice_id: int):
    if "file" not in request.files:
        return {"error": "No file field provided"}, 400
    file = request.files["file"]
    if not file.filename:
        return {"error": "Empty filename"}, 400
    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Only PDF allowed"}, 400

    fname = secure_filename(file.filename)
    save_as = f"invoice-{invoice_id}-{fname}"
    abs_path = os.path.join(UPLOAD_DIR, save_as)

    session = SessionLocal()
    try:
        inv = session.get(Invoice, invoice_id)
        if not inv:
            return {"error": "Invoice not found"}, 404

        if inv.pdf_path:
            try:
                os.remove(os.path.join(os.path.dirname(__file__), inv.pdf_path))
            except FileNotFoundError:
                pass

        file.save(abs_path)
        inv.pdf_path = f"uploads/{save_as}"
        session.commit()
        session.refresh(inv)
        return serialize(inv)
    finally:
        session.close()


@app.route("/invoices/<int:invoice_id>/pdf", methods=["DELETE"])
def delete_invoice_pdf(invoice_id: int):
    session = SessionLocal()
    try:
        inv = session.get(Invoice, invoice_id)
        if not inv:
            return {"error": "Invoice not found"}, 404
        if not inv.pdf_path:
            return {"message": "Nothing to delete"}, 200

        try:
            os.remove(os.path.join(os.path.dirname(__file__), inv.pdf_path))
        except FileNotFoundError:
            pass

        inv.pdf_path = None
        session.commit()
        session.refresh(inv)
        return serialize(inv)
    finally:
        session.close()


@app.route("/invoices/<int:invoice_id>/pdf", methods=["GET"])
def get_invoice_pdf(invoice_id: int):
    session = SessionLocal()
    try:
        inv = session.get(Invoice, invoice_id)
        if not inv:
            return {"error": "Invoice not found"}, 404
        if not inv.pdf_path:
            return {"error": "PDF not uploaded"}, 404

        directory = os.path.dirname(__file__)
        folder, filename = os.path.split(inv.pdf_path) 
        return send_from_directory(os.path.join(directory, folder), filename,
                                   mimetype="application/pdf")
    finally:
        session.close()


@app.before_request
def seed_once():
    global _seed_done
    if _seed_done:
        return
    session = SessionLocal()
    try:
        if session.query(Invoice).count() == 0:
            session.add_all([
                Invoice(invoice_number="INV-2025-0001", client_name="Acme Corp", amount=1200.50,
                        issue_date=date(2025, 8, 1), due_date=date(2025, 9, 1), status="unpaid"),
                Invoice(invoice_number="INV-2025-0002", client_name="Globex", amount=890.00,
                        issue_date=date(2025, 8, 5), due_date=date(2025, 8, 25), status="paid"),
                Invoice(invoice_number="INV-2025-0003", client_name="Initech", amount=450.75,
                        issue_date=date(2025, 8, 10), due_date=date(2025, 8, 30), status="overdue"),
            ])
            session.commit()
        _seed_done = True
    finally:
        session.close()


if __name__ == "__main__":
    app.run(debug=True)
