from fastapi import APIRouter
import os
import json

router = APIRouter()

@router.get("/{image_id}")
async def get_status(image_id: str):
    status_path = f"uploads/{image_id}_status.json"
    if os.path.exists(status_path):
        with open(status_path, "r") as f:
            return json.load(f)
    return {"id": image_id, "status": "processing"}
