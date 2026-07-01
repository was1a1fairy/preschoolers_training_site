from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.db import models
from backend.schemas.task import TaskBase
from backend.schemas.stat import ProgressCreate


def get_all_categories(db: Session) -> List[Dict[str, Any]]:
    """Return all categories as serializable dictionaries."""
    return [
        {
            "id": category.id,
            "name": category.name,
            "icon_url": category.icon_url,
        }
        for category in db.query(models.Category).all()
    ]


def create_category(db: Session, name: str, icon_url: Optional[str] = None) -> models.Category:
    """Create a new category."""
    try:
        category = models.Category(name=name, icon_url=icon_url)
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create category")


def delete_category(db: Session, category_id: int) -> bool:
    """Delete a category and all related tasks and progress entries."""
    try:
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        task_ids = [task_id for (task_id,) in db.query(models.Task.id).filter(models.Task.category_id == category_id).all()]
        if task_ids:
            db.query(models.UserProgress).filter(models.UserProgress.task_id.in_(task_ids)).delete(synchronize_session=False)
            db.query(models.Task).filter(models.Task.category_id == category_id).delete(synchronize_session=False)

        db.delete(category)
        db.commit()
        return True
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete category")


def get_task_by_id(db: Session, task_id: int) -> Optional[models.Task]:
    """Return a task by id if present."""
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def get_tasks_by_category(db: Session, category_id: int) -> List[models.Task]:
    """Return all tasks belonging to a category."""
    return db.query(models.Task).filter(models.Task.category_id == category_id).all()


def create_task(db: Session, task_data: TaskBase) -> models.Task:
    """Create a new task from validated input."""
    try:
        db_task = models.Task(
            category_id=task_data.category_id,
            type="choice",
            question=task_data.question,
            options=task_data.options,
            correct_answer=task_data.correct_answer,
            image=task_data.image,
            difficulty_level=task_data.difficulty_level,
            min_age=task_data.min_age,
            max_age=task_data.max_age,
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create task")


def update_task(db: Session, task_id: int, task_data: TaskBase) -> models.Task:
    """Update an existing task."""
    try:
        db_task = get_task_by_id(db, task_id)
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")

        db_task.category_id = task_data.category_id
        db_task.type = "choice"
        db_task.question = task_data.question
        db_task.options = task_data.options
        db_task.correct_answer = task_data.correct_answer
        db_task.image = task_data.image
        db_task.difficulty_level = task_data.difficulty_level
        db_task.min_age = task_data.min_age
        db_task.max_age = task_data.max_age
        db.commit()
        db.refresh(db_task)
        return db_task
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update task")


def delete_task(db: Session, task_id: int) -> Dict[str, str]:
    """Delete a task by id."""
    try:
        db_task = get_task_by_id(db, task_id)
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")

        db.delete(db_task)
        db.commit()
        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete task")


def save_user_progress(db: Session, user_id: int, progress_data: ProgressCreate) -> models.UserProgress:
    """Save a single user progress record."""
    try:
        db_progress = models.UserProgress(
            user_id=user_id,
            task_id=progress_data.task_id,
            is_correct=progress_data.is_correct,
        )
        db.add(db_progress)
        db.commit()
        db.refresh(db_progress)
        return db_progress
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save progress")


def get_user_progress(db: Session, user_id: int) -> List[models.UserProgress]:
    """Return all progress entries for a user."""
    return db.query(models.UserProgress).filter(models.UserProgress.user_id == user_id).all()
