# Database logic (SQLAlchemy)
from sqlalchemy import create_engine, Column, Integer, String, Float, Date
from sqlalchemy.orm import declarative_base, sessionmaker

ENGINE = create_engine("sqlite:///backend/invoices.db", echo=False, future=True)
SessionLocal = sessionmaker(bind=ENGINE, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    invoice_number = Column(String, nullable=False)
    client_name   = Column(String, nullable=False)
    amount        = Column(Float,  nullable=False, default=0.0)
    issue_date    = Column(Date,   nullable=True)
    due_date      = Column(Date,   nullable=True)
    status        = Column(String, nullable=False, default="unpaid")  
    pdf_path      = Column(String, nullable=True)

def init_db():
    Base.metadata.create_all(ENGINE)
