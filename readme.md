# Выбирашка

Веб-приложение для обучения дошкольников с авторизацией, заданиями, категориями и административной панелью.

Backend написан на FastAPI и SQLAlchemy, frontend - на HTML, CSS и JavaScript.

## Возможности

Для пользователей:

- регистрация и авторизация;
- просмотр категорий;
- прохождение обучающих заданий;
- сохранение прогресса;
- просмотр результатов.

Для администратора:

- управление пользователями;
- добавление и редактирование категорий;
- создание и изменение заданий;
- загрузка изображений;
- просмотр статистики.

## Технологии

- Python 3.11+
- FastAPI
- SQLAlchemy
- Pydantic
- JWT через `python-jose`
- Passlib и bcrypt
- SQLite по умолчанию
- PostgreSQL опционально

## База данных и конфигурация

Настройки читаются из переменных окружения и файла `.env` в корне проекта.

Пример файла уже есть в репозитории:

```bash
cp .env.example .env
```

По умолчанию используется SQLite:

```env
SQL_URL=sqlite:///./repo.db
```

Файл `repo.db` будет создан автоматически при первом запуске. Таблицы тоже создаются автоматически через SQLAlchemy, поэтому для локального запуска с SQLite отдельные миграции не нужны.

PostgreSQL можно включить без изменения кода, заменив `SQL_URL`:

```env
SQL_URL=postgresql://postgres:password@localhost:5432/postgres
```

Также в `.env` можно задать данные администратора и секрет JWT:

```env
SECRET_KEY_JWT=change-me
DEFAULT_ADMIN_EMAIL=admin@vibirashka.ru
DEFAULT_ADMIN_PASSWORD=Admin12345
```

При первом запуске приложение создаёт администратора автоматически, если пользователя с таким email ещё нет.

## Запуск через uv

Рекомендуемый способ для локальной разработки:

```bash
git clone https://github.com/was1a1fairy/preschoolers_training_site.git
cd preschoolers_training_site

cp .env.example .env
uv sync
uv run uvicorn backend.main:app --reload
```

Если нужно использовать отдельный cache внутри проекта:

```bash
uv --cache-dir .uv-cache sync
uv --cache-dir .uv-cache run uvicorn backend.main:app --reload
```

После запуска:

- приложение: http://127.0.0.1:8000
- Swagger UI: http://127.0.0.1:8000/docs

## Запуск через pip

Альтернативный способ без `uv`:

```bash
git clone https://github.com/was1a1fairy/preschoolers_training_site.git
cd preschoolers_training_site

python3.11 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn backend.main:app --reload
```

Для Windows активация окружения:

```powershell
.venv\Scripts\activate
```

## Структура проекта

```text
backend/
├── api/          # REST API и роутеры
├── db/           # ORM-модели и подключение к БД
├── schemas/      # Pydantic-схемы
├── config.py     # настройки приложения
└── main.py       # точка входа FastAPI

frontend/
├── src/          # JavaScript
└── static/       # HTML и CSS
```

## Авторизация

В проекте используется JWT-аутентификация.

После входа пользователь получает токен, который передается в заголовке:

```http
Authorization: Bearer <token>
```

## Проверка запуска

Логин администратора после первого запуска:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vibirashka.ru","password":"Admin12345"}'
```
