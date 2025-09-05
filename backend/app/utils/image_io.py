from pathlib import Path
from fastapi import UploadFile
import shutil

def save_upload(file: UploadFile, dst_dir: Path) -> Path:
    dst_dir.mkdir(parents=True, exist_ok=True)
    dst = dst_dir / file.filename
    with dst.open("wb") as f:
        shutil.copyfileobj(file.file, f)
    file.file.close()
    return dst
