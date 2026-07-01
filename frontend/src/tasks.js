let currentTasks = [];
let currentTaskIndex = 0;
document.addEventListener("DOMContentLoaded", loadTask);
async function loadTask() {
    const container = document.getElementById("taskContainer");
    container.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <div class="loading-text">Загрузка заданий...</div>
        </div>
    `;
    
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category");
    const age = localStorage.getItem("selectedAge");

    try {
        currentTasks = await API.getTasksByCategory(categoryId, age);
        
        if (currentTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-title">Пока заданий нет</div>
                    <div class="empty-state-text">Администратор скоро добавит задания для этого возраста</div>
                    <a href="/categories" class="btn btn-primary mt-3">📚 Вернуться к категориям</a>
                </div>
            `;
            return;
        }
        currentTaskIndex = 0;
        renderTask();
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">😔</div>
                <div class="empty-state-title">Не удалось загрузить задания</div>
                <div class="empty-state-text">Попробуйте обновить страницу</div>
                <a href="/categories" class="btn btn-primary mt-3">📚 Вернуться к категориям</a>
            </div>
        `;
        console.error("Failed to load tasks:", error);
    }
}

function renderTask() {
    const currentTask = currentTasks[currentTaskIndex];
    const container = document.getElementById("taskContainer");
    
    let taskHTML = `
        <div class="card fade-in">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="badge bg-secondary">📝 Задание ${currentTaskIndex + 1} из ${currentTasks.length}</span>
                    <span class="badge bg-info">⭐ Сложность: ${currentTask.difficulty_level}</span>
                </div>
                ${currentTask.image ? `
                    <div class="text-center mb-4">
                        <img
                            src="http://127.0.0.1:8000${currentTask.image}"
                            class="img-fluid rounded shadow-sm"
                            style="max-height:300px; object-fit:contain;">
                    </div>
                ` : ""}
                <h3 class="mb-4">${currentTask.question || 'Задание'}</h3>
                <div id="answers"></div>
                <div class="mt-4">
                    ${currentTaskIndex > 0 ? `<button class="btn btn-secondary me-2" onclick="prevTask()">← Назад</button>` : ''}
                    ${currentTaskIndex < currentTasks.length - 1 ? `<button class="btn btn-primary" onclick="nextTask()">Далее →</button>` : `<button class="btn btn-success" onclick="finishTasks()">🎉 Завершить</button>`}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = taskHTML;
    
    const answers = document.getElementById("answers");
    if (currentTask.options) {
        currentTask.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-primary w-100 mt-3';
            btn.style.animationDelay = `${index * 0.05}s`;
            btn.onclick = () => checkAnswer(option);
            btn.textContent = option;
            answers.appendChild(btn);
        });
    } else {
        answers.innerHTML = `<p class="text-muted">Тип задания: ${currentTask.type}</p>`;
    }
}

function nextTask() {
    if (currentTaskIndex < currentTasks.length - 1) {
        currentTaskIndex++;
        renderTask();
    }
}

function prevTask() {
    if (currentTaskIndex > 0) {
        currentTaskIndex--;
        renderTask();
    }
}

function finishTasks() {
    Notify.success("🎉 Отличная работа! Вы выполнили все задания.");
    window.location.href = "/profile";
}

async function checkAnswer(answer) {
    const currentTask = currentTasks[currentTaskIndex];
    let correct = false;
    
    correct = answer === currentTask.correct_answer;
    
    if (correct) {
        Notify.success("🌟 Молодец!", "Ответ правильный!");
    } else {
        Notify.warning("🙂 Почти получилось!", "Попробуйте ещё раз.");
    }
    
    const token = localStorage.getItem("token");
    if (token) {
        await API.saveProgress(currentTask.id, correct);
    }
}