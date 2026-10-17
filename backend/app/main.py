from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import areas, city, simulation, auth, government, ingestion, indicators, facilities, data_sources
from app.core.config import settings
from app.core.exceptions import UISBaseException, uis_exception_handler

app = FastAPI(
    title="Urban Intelligence System API",
    description="Backend API for UIS — adaptive urban development assessment",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Exception handlers
app.add_exception_handler(UISBaseException, uis_exception_handler)

# CORS — allow frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(areas.router, prefix="/api/v1")
app.include_router(city.router, prefix="/api/v1")
app.include_router(simulation.router, prefix="/api/v1")
app.include_router(indicators.router, prefix="/api/v1")
app.include_router(government.router, prefix="/api/v1")
app.include_router(ingestion.router, prefix="/api/v1")
app.include_router(facilities.router, prefix="/api/v1")
app.include_router(data_sources.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "UIS Backend"}


@app.get("/")
def root():
    return {
        "service": "Urban Intelligence System API",
        "docs": "/api/docs",
        "version": "1.0.0"
    }