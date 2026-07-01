// Глобальная функция для кнопки выхода
function logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
}

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "/";
        return;
    }

    async function loadProfile() {
        try {
            const user = await API.getCurrentUser();
            document.getElementById("userEmail").textContent = user.email;
            document.getElementById("userName").textContent = user.email.split('@')[0];

            const stats = await API.getProfileStats();

            document.getElementById("tasksCount").textContent = stats.completed_tasks;
            document.getElementById("attemptsCount").textContent = stats.total_attempts;
            document.getElementById("accuracyPercent").textContent = stats.success_rate + "%";
            document.getElementById("categoriesCount").textContent = stats.categories_completed;
            document.getElementById("lastActivity").textContent = stats.last_activity;

            const progressPercent = Math.min(stats.success_rate, 100);
            const progressBar = document.getElementById("progressBar");
            progressBar.style.width = progressPercent + "%";
            progressBar.textContent = progressPercent + "%";

            const list = document.getElementById("categoryProgressList");
            if (stats.category_progress.length === 0) {
                list.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📚</div>
                        <div class="empty-state-title">Пока нет прогресса по категориям</div>
                        <div class="empty-state-text">Начните решать задания, и здесь появится статистика.</div>
                    </div>
                `;
                return;
            }

            list.innerHTML = stats.category_progress.map(item => `
                <div class="admin-list-item">
                    <span>${item.category_name}</span>
                    <span><strong>${item.correct_answers}</strong> / ${item.total_tasks}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error("Не удалось загрузить профиль:", error);
            const list = document.getElementById("categoryProgressList");
            if (list) {
                list.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <div class="empty-state-title">Не удалось загрузить данные профиля</div>
                        <div class="empty-state-text">Проверьте подключение или попробуйте обновить страницу.</div>
                    </div>
                `;
            }
        }
    }

    await loadProfile();
});

