import os
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(prefix="/api/upload", tags=["Upload"])

BASE_DIR = Path("backend/uploads")


@router.post("/{folder}")
async def upload_image(folder: str, file: UploadFile = File(...)):
    if folder not in ["categories", "tasks"]:
        raise HTTPException(status_code=400, detail="Неверная папка")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Файл должен быть изображением")

    upload_dir = BASE_DIR / folder
    upload_dir.mkdir(parents=True, exist_ok=True)

    extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{extension}"

    file_path = upload_dir / filename

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    return {
        "image": f"/uploads/{folder}/{filename}"
    }
