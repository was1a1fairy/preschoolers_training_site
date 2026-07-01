from fastapi import Depends, FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from backend.api.admin import router as admin_router
from backend.api.auth import router as auth_router
from backend.api.content import router as content_router
from backend.api.upload import router as upload_router
from backend.api.services.auth_service import pwd_context
from backend.db import models
from backend.config import settings
from backend.db.base import SessionLocal, init_db
from backend.dependencies import get_admin

def create_default_admin() -> None:
    """Ensure the default admin user exists."""
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.email == settings.default_admin_email).first()
        if not admin:
            admin = models.User(
                email=settings.default_admin_email,
                hashed_password=pwd_context.hash(settings.default_admin_password),
                role="admin",
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()


app = FastAPI(title="Preschoolers Training Site")

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
app.mount("/src", StaticFiles(directory="frontend/src"), name="src")
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

init_db()
create_default_admin()

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"], dependencies=[Depends(get_admin)])
app.include_router(content_router, prefix="/api", tags=["content"])
app.include_router(upload_router)


@app.get("/")
def home() -> FileResponse:
    """Serve the home page."""
    return FileResponse("frontend/static/index.html")


@app.get("/categories")
def categories() -> FileResponse:
    """Serve the categories page."""
    return FileResponse("frontend/static/categories.html")


@app.get("/tasks")
def tasks() -> FileResponse:
    """Serve the tasks page."""
    return FileResponse("frontend/static/tasks.html")


@app.get("/profile")
def profile() -> FileResponse:
    """Serve the profile page."""
    return FileResponse("frontend/static/profile.html")


@app.get("/admin")
def admin() -> FileResponse:
    """Serve the admin page."""
    return FileResponse("frontend/static/admin.html")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
