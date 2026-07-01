from typing import Any, Dict, List

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.db import models


def get_admin_statistics(db: Session) -> Dict[str, Any]:
    """Build a summary of app usage for administrators."""
    total_users = db.query(models.User).count()
    total_tasks = db.query(models.Task).count()
    total_attempts = db.query(models.UserProgress).count()
    completed_tasks = db.query(models.UserProgress).filter(models.UserProgress.is_correct.is_(True)).count()
    active_users = db.query(models.UserProgress.user_id).distinct().count()
    success_rate = round((completed_tasks / total_attempts * 100) if total_attempts else 0)

    tasks_by_category = (
        db.query(models.Task.category_id, models.Category.name, func.count(models.Task.id))
        .join(models.Category)
        .group_by(models.Task.category_id, models.Category.name)
        .all()
    )

    tasks_by_category_list: List[Dict[str, Any]] = []
    for category_id, name, count in tasks_by_category:
        correct_count = (
            db.query(models.UserProgress)
            .join(models.Task, models.UserProgress.task_id == models.Task.id)
            .filter(models.Task.category_id == category_id, models.UserProgress.is_correct.is_(True))
            .count()
        )
        attempts_count = (
            db.query(models.UserProgress)
            .join(models.Task, models.UserProgress.task_id == models.Task.id)
            .filter(models.Task.category_id == category_id)
            .count()
        )
        tasks_by_category_list.append(
            {
                "category_id": category_id,
                "category_name": name,
                "total_tasks": count,
                "correct_answers": correct_count,
                "attempts": attempts_count,
                "success_rate": round((correct_count / attempts_count * 100) if attempts_count else 0),
            }
        )

    return {
        "total_users": total_users,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "total_attempts": total_attempts,
        "active_users": active_users,
        "success_rate": success_rate,
        "tasks_by_category": tasks_by_category_list,
    }


def get_user_statistics(db: Session, user_id: int) -> Dict[str, Any]:
    """Build a detailed statistics snapshot for one user."""
    total_tasks = db.query(models.Task).count()
    total_attempts = db.query(models.UserProgress).filter(models.UserProgress.user_id == user_id).count()
    completed_tasks = (
        db.query(models.UserProgress)
        .filter(models.UserProgress.user_id == user_id, models.UserProgress.is_correct.is_(True))
        .count()
    )
    success_rate = round((completed_tasks / total_attempts * 100) if total_attempts else 0)
    categories_completed = (
        db.query(models.Task.category_id)
        .join(models.UserProgress, models.Task.id == models.UserProgress.task_id)
        .filter(models.UserProgress.user_id == user_id, models.UserProgress.is_correct.is_(True))
        .distinct()
        .count()
    )

    last_record = (
        db.query(models.UserProgress)
        .filter(models.UserProgress.user_id == user_id)
        .order_by(models.UserProgress.created_at.desc())
        .first()
    )

    category_progress: List[Dict[str, Any]] = []
    for category in db.query(models.Category).all():
        total_in_category = db.query(models.Task).filter(models.Task.category_id == category.id).count()
        if total_in_category == 0:
            continue

        category_correct = (
            db.query(models.UserProgress)
            .join(models.Task, models.UserProgress.task_id == models.Task.id)
            .filter(models.UserProgress.user_id == user_id, models.Task.category_id == category.id, models.UserProgress.is_correct.is_(True))
            .count()
        )
        category_attempts = (
            db.query(models.UserProgress)
            .join(models.Task, models.UserProgress.task_id == models.Task.id)
            .filter(models.UserProgress.user_id == user_id, models.Task.category_id == category.id)
            .count()
        )
        category_progress.append(
            {
                "category_id": category.id,
                "category_name": category.name,
                "total_tasks": total_in_category,
                "correct_answers": category_correct,
                "attempts": category_attempts,
                "success_rate": round((category_correct / category_attempts * 100) if category_attempts else 0),
            }
        )

    category_progress.sort(key=lambda item: item["correct_answers"], reverse=True)

    return {
        "completed_tasks": completed_tasks,
        "total_attempts": total_attempts,
        "success_rate": success_rate,
        "categories_completed": categories_completed,
        "total_tasks": total_tasks,
        "last_activity": last_record.created_at.strftime("%d.%m.%Y") if last_record and last_record.created_at else "Пока нет",
        "category_progress": category_progress,
    }
