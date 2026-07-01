from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Literal, Optional
from enum import Enum


class TaskBase(BaseModel):
    category_id: int
    question: str
    options: list[str]
    correct_answer: str
    image: str | None
    difficulty_level: int
    min_age: int
    max_age: int

class TaskOut(TaskBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
