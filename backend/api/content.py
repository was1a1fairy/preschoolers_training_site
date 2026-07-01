from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.api.services.content_service import get_all_categories, get_task_by_id, get_tasks_by_category, get_user_progress, save_user_progress
from backend.api.services.stats_service import get_user_statistics
from backend.db import models
from backend.db.base import get_db
from backend.dependencies import get_current_user
from backend.schemas.category import CategoryOut
from backend.schemas.stat import ProfileStatsResponse, ProgressCreate, ProgressOut
from backend.schemas.task import TaskOut

router = APIRouter()


@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)) -> List[CategoryOut]:
    """Return all available categories."""
    return get_all_categories(db)


@router.get("/categories/{category_id}/tasks", response_model=List[TaskOut])
def get_tasks(category_id: int, age: Optional[int] = None, db: Session = Depends(get_db)) -> List[TaskOut]:
    """Return tasks for a category. Age filtering is kept for future use."""
    return get_tasks_by_category(db, category_id)


@router.get("/tasks/{task_id}", response_model=TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db)) -> TaskOut:
    """Return one task by id."""
    return get_task_by_id(db, task_id)


@router.get("/profile/stats", response_model=ProfileStatsResponse)
def get_profile_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return extended statistics for the authenticated user."""
    return get_user_statistics(db, current_user.id)


@router.post("/progress", response_model=ProgressOut)
def save_progress(
    progress_data: ProgressCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProgressOut:
    """Save the result of a completed task."""
    return save_user_progress(db, current_user.id, progress_data)


@router.get("/progress", response_model=List[ProgressOut])
def get_progress(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)) -> List[ProgressOut]:
    """Return all progress entries for the current user."""
    return get_user_progress(db, current_user.id)
