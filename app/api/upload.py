from fastapi import APIRouter, UploadFile, File
import uuid
import shutil
import os
from app.queues.connection import send_to_resize_queue

router = APIRouter()

UPLOAD_DIR = "uploads"

@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    image_id = str(uuid.uuid4())
    filepath = os.path.join(UPLOAD_DIR, f"{image_id}_{file.filename}")
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    send_to_resize_queue({
        "id": image_id,
        "filename": file.filename,
        "path": filepath
    })

    return {"id": image_id, "status": "uploaded"}
