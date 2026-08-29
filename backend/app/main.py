from fastapi import FastAPI
from app.api.v1.api import api_router

app = FastAPI(
    title="Vaanam API",
    description="Backend API for Vaanam - Environmental Intelligence & Compliance Platform",
    version="1.0.0"
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Vaanam API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
