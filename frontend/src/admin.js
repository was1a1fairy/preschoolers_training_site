let uploadedCategoryImage = null;
let uploadedTaskImage = null;

document.addEventListener("DOMContentLoaded", initAdmin);

async function initAdmin() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/";
        return;
    }

    try {
        const user = await API.getCurrentUser();
        if (user.role !== "admin") {
            Notify.error("Ошибка", "Доступ только для администраторов");
            window.location.href = "/";
            return;
        }
    } catch (error) {
        window.location.href = "/";
        return;
    }

    loadStats();
    loadCategories();
    loadTasks();
    loadCategoriesSelect();
    setupForms();

    document
        .getElementById("categoryImageFile")
        ?.addEventListener("change", uploadCategoryImage);
    document
        .getElementById("taskImageFile")
        ?.addEventListener("change", uploadTaskImage);
}

async function loadStats() {
    const container = document.getElementById("statsContainer");
    try {
        const stats = await API.getStats();
        container.innerHTML = `
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-value">${stats.total_users}</div>
                        <div class="stat-label">пользователей</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-icon">📝</div>
                        <div class="stat-value">${stats.total_tasks}</div>
                        <div class="stat-label">всего заданий</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-value">${stats.completed_tasks}</div>
                        <div class="stat-label">верных ответов</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-value">${stats.success_rate}%</div>
                        <div class="stat-label">точность</div>
                    </div>
                </div>
            </div>
            <div class="row g-4 mt-1">
                <div class="col-md-6">
                    <div class="stat-card">
                        <div class="stat-icon">⚡</div>
                        <div class="stat-value">${stats.total_attempts}</div>
                        <div class="stat-label">всего попыток</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="stat-card">
                        <div class="stat-icon">🌟</div>
                        <div class="stat-value">${stats.active_users}</div>
                        <div class="stat-label">активных пользователей</div>
                    </div>
                </div>
            </div>
            <div class="admin-section mt-4">
                <div class="admin-section-header">
                    <span class="admin-section-icon">📚</span>
                    <h3 class="admin-section-title">прогресс по категориям</h3>
                </div>
                <div>
                    ${stats.tasks_by_category.map(cat => `
                        <div class="admin-list-item">
                            <span>${cat.category_name}</span>
                            <span><strong>${cat.correct_answers}</strong> / ${cat.total_tasks}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">😔</div>
                <div class="empty-state-title">Не удалось загрузить статистику</div>
                <div class="empty-state-text">Попробуйте обновить страницу</div>
            </div>
        `;
        console.error("Failed to load stats:", error);
    }
}

async function loadCategories() {
    const container = document.getElementById("categoriesList");
    try {
        const categories = await API.getCategories();
        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-title">Категорий пока нет</div>
                    <div class="empty-state-text">Создайте первую категорию через форму выше</div>
                </div>
            `;
            return;
        }
        container.innerHTML = `
            <div class="row g-4">
                ${categories.map(cat => `
                    <div class="col-md-6 col-lg-4">
                        <div class="admin-category-card">
                            <div class="admin-category-media category-preview-shell">
                                ${cat.icon_url
                                    ? `<img src="${SERVER_URL}${cat.icon_url}" class="admin-category-image category-preview-image">`
                                    : `<div class="admin-category-placeholder category-preview-fallback"><span class="bi bi-grid-3x3-gap-fill category-preview-icon"></span></div>`
                                }
                            </div>
                            <h5 class="mt-3 mb-3">${cat.name}</h5>
                            <div class="d-flex justify-content-center gap-2 flex-wrap">
                                <button class="btn btn-outline-danger btn-sm" onclick="deleteCategory(${cat.id})">
                                    <i class="bi bi-trash"></i> Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">😔</div>
                <div class="empty-state-title">Не удалось загрузить категории</div>
                <div class="empty-state-text">Попробуйте обновить страницу</div>
            </div>
        `;
        console.error("Failed to load categories:", error);
    }
}

async function deleteCategory(categoryId) {
    const result = await Notify.confirm(
        "Удалить категорию?",
        "Все задания этой категории тоже будут удалены."
    );

    if (!result.isConfirmed) {
        return;
    }

    try {
        await API.deleteCategory(categoryId);
        await Notify.success("Удалено", "Категория успешно удалена");
        loadCategories();
        loadTasks();
        loadCategoriesSelect();
        loadStats();
    } catch (error) {
        Notify.error("Ошибка", error.message);
    }
}

async function loadTasks() {
    const container = document.getElementById("tasksList");
    try {
        const [tasks, categories] = await Promise.all([
            API.getTasksAdmin(),
            API.getCategories()
        ]);

        const categoryMap = Object.fromEntries(categories.map(cat => [cat.id, cat.name]));

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-title">Заданий пока нет</div>
                    <div class="empty-state-text">Создайте первое задание через форму выше</div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="row g-4">
                ${tasks.map(task => `
                    <div class="col-md-6 col-lg-4">
                        <div class="admin-task-card">
                            <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
                                <div>
                                    <div class="small text-muted">${categoryMap[task.category_id] || "Без категории"}</div>
                                    <h6 class="mb-0">${task.question}</h6>
                                </div>
                                <span class="badge bg-info text-dark">${task.difficulty_level}</span>
                            </div>
                            <div class="small text-muted mb-2">Варианты:</div>
                            <ul class="mb-3 ps-3">
                                ${task.options.map(option => `<li>${option}</li>`).join('')}
                            </ul>
                            <div class="small text-success">Правильный ответ: ${task.correct_answer}</div>
                            ${task.image ? `<img src="${SERVER_URL}${task.image}" class="admin-task-image mt-3">` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">😔</div>
                <div class="empty-state-title">Не удалось загрузить задания</div>
                <div class="empty-state-text">Попробуйте обновить страницу</div>
            </div>
        `;
        console.error("Failed to load tasks:", error);
    }
}

async function loadCategoriesSelect() {
    try {
        const categories = await API.getCategories();
        const select = document.getElementById("taskCategory");
        select.innerHTML = categories.map(cat => `
            <option value="${cat.id}">${cat.name}</option>
        `).join('');
    } catch (error) {
        console.error("Failed to load categories select:", error);
    }
}

function setupForms() {
    const createCategoryForm = document.getElementById("createCategoryForm");
    if (createCategoryForm) {
        createCategoryForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("categoryName").value;
            try {
                await API.createCategory(name, uploadedCategoryImage);
                Notify.success("📚 Категория успешно создана.");
                createCategoryForm.reset();
                uploadedCategoryImage = null;
                document.getElementById("categoryPreview").style.display = "none";
                loadCategories();
                loadCategoriesSelect();
                loadStats();
            } catch (error) {
                Notify.error("😔 Что-то пошло не так.", error.message);
            }
        });
    }

    const createTaskForm = document.getElementById("createTaskForm");
    if (createTaskForm) {
        createTaskForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            try {
                const taskData = {
                    category_id: parseInt(document.getElementById("taskCategory").value),
                    question: document.getElementById("taskQuestion").value,
                    options: document.getElementById("taskOptions").value.split(",").map(item => item.trim()),
                    correct_answer: document.getElementById("taskCorrectAnswer").value,
                    image: uploadedTaskImage,
                    difficulty_level: parseInt(document.getElementById("taskDifficulty").value),
                    min_age: parseInt(document.getElementById("taskMinAge").value),
                    max_age: parseInt(document.getElementById("taskMaxAge").value)
                };
                await API.createTask(taskData);
                Notify.success("✨ Задание успешно создано.");
                createTaskForm.reset();
                uploadedTaskImage = null;
                document.getElementById("taskPreview").style.display = "none";
                loadStats();
                loadTasks();
            } catch (error) {
                Notify.error("😔 Что-то пошло не так.", error.message);
            }
        });
    }
}

async function uploadCategoryImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
        `${SERVER_URL}/api/upload/categories`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    uploadedCategoryImage = data.image;

    const preview = document.getElementById("categoryPreview");
    preview.src = SERVER_URL + data.image;
    preview.style.display = "block";
}

async function uploadTaskImage(e) {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
        `${SERVER_URL}/api/upload/tasks`,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    uploadedTaskImage = data.image;

    const preview = document.getElementById("taskPreview");
    preview.src = SERVER_URL + data.image;
    preview.style.display = "block";
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
}
