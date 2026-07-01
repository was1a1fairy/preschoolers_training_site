from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.api.services.content_service import create_category, create_task, delete_category, delete_task, update_task
from backend.api.services.stats_service import get_admin_statistics
from backend.db import models
from backend.db.base import get_db
from backend.dependencies import get_admin
from backend.schemas.category import CategoryCreate, CategoryOut
from backend.schemas.stat import StatsResponse
from backend.schemas.task import TaskBase, TaskOut

router = APIRouter()


@router.post("/categories", response_model=CategoryOut)
def create_new_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin),
) -> CategoryOut:
    """Create a new content category."""
    return create_category(db, category_data.name, category_data.icon_url)


@router.get("/tasks", response_model=List[TaskOut])
def get_all_tasks(db: Session = Depends(get_db), admin: models.User = Depends(get_admin)) -> List[TaskOut]:
    """Return all tasks for the admin panel."""
    return db.query(models.Task).order_by(models.Task.id.desc()).all()


@router.post("/tasks", response_model=TaskOut)
def create_new_task(
    task_data: TaskBase,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin),
) -> TaskOut:
    """Create a new task."""
    return create_task(db, task_data)


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_existing_task(
    task_id: int,
    task_data: TaskBase,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin),
) -> TaskOut:
    """Update an existing task."""
    return update_task(db, task_id, task_data)


@router.delete("/categories/{category_id}")
def delete_existing_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin),
) -> dict:
    """Delete a category and all related content."""
    return {"success": delete_category(db, category_id)}


@router.delete("/tasks/{task_id}")
def delete_existing_task(
    task_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_admin),
) -> dict:
    """Delete a task."""
    return delete_task(db, task_id)


@router.get("/stats", response_model=StatsResponse)
def get_statistics(db: Session = Depends(get_db), admin: models.User = Depends(get_admin)) -> StatsResponse:
    """Return aggregated statistics for the admin dashboard."""
    return get_admin_statistics(db)

