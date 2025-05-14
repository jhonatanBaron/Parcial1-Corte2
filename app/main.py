from fastapi import FastAPI
from app.api.upload import router as upload_router
from app.api.status import router as status_router

app = FastAPI()

app.include_router(upload_router, prefix="/upload")
app.include_router(status_router, prefix="/status")
