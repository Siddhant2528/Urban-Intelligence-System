"""
Data Sources API Router.
Tracks provenance, data lineage, update frequencies, and reliability status.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from app.api.deps import get_db, get_current_government_user
from app.models.data_source import DataSource
from app.core.exceptions import EntityNotFoundException, UISBaseException

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])


class DataSourceCreate(BaseModel):
    name: str
    category: str
    source_url: Optional[str] = None
    update_frequency: Optional[str] = "monthly"
    quality_flag: Optional[str] = "verified"


@router.get("/")
def list_data_sources(db: Session = Depends(get_db)):
    """List all registered urban data sources and their real-time sync status."""
    sources = db.query(DataSource).all()
    return {
        "total_sources": len(sources),
        "sources": [
            {
                "id": s.id,
                "name": s.name,
                "category": s.category,
                "source_url": s.source_url,
                "update_frequency": s.update_frequency,
                "quality_flag": s.quality_flag,
                "status": s.status,
                "records_count": s.records_count,
                "last_synced_at": s.last_synced_at,
            }
            for s in sources
        ],
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def register_data_source(
    source_in: DataSourceCreate,
    db: Session = Depends(get_db),
    _user = Depends(get_current_government_user),
):
    """Register a new external data source feed. Requires government privileges."""
    existing = db.query(DataSource).filter(DataSource.name == source_in.name).first()
    if existing:
        raise UISBaseException(
            message=f"A data source named '{source_in.name}' already exists.",
            status_code=status.HTTP_409_CONFLICT,
            error_code="SOURCE_ALREADY_EXISTS"
        )

    ds = DataSource(
        name=source_in.name,
        category=source_in.category,
        source_url=source_in.source_url,
        update_frequency=source_in.update_frequency,
        quality_flag=source_in.quality_flag,
        status="active",
        records_count=0,
        last_synced_at=datetime.now(timezone.utc),
    )
    db.add(ds)
    db.commit()
    db.refresh(ds)
    return ds
