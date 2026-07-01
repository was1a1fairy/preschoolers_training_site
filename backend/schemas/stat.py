from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List

class ProgressCreate(BaseModel):
    task_id: int
    is_correct: bool

class ProgressOut(ProgressCreate):
    id: int
    user_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProfileStatsResponse(BaseModel):
    completed_tasks: int
    total_attempts: int
    success_rate: int
    categories_completed: int
    total_tasks: int
    last_activity: str
    category_progress: List[dict]

class StatsResponse(BaseModel):
    total_users: int
    total_tasks: int
    completed_tasks: int
    total_attempts: int
    active_users: int
    success_rate: int
    tasks_by_category: List[dict]
