async function loadCategories() {
    const container = document.getElementById("categoriesContainer");
    container.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <div class="loading-text">Загрузка категорий...</div>
        </div>
    `;
    
    try {
        const categories = await API.getCategories();
        
        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-title">Пока категорий нет</div>
                    <div class="empty-state-text">Администратор скоро добавит задания</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        categories.forEach((category, index) => {
            const card = document.createElement('div');
            card.className = 'col-md-4 fade-in';
            card.style.animationDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <div class="card category-card">
                    <div class="card-body text-center">
                        <div class="category-preview-shell">
                            ${category.icon_url ? `
                                <img
                                    src="${SERVER_URL}${category.icon_url}"
                                    class="category-preview-image"
                                >
                            ` : '<div class="category-preview-fallback"><span class="bi bi-grid-3x3-gap-fill category-preview-icon"></span></div>'}
                        </div>
                        <h3>${category.name}</h3>
                        <button class="btn btn-primary mt-3" onclick="openCategory(${category.id})">
                            ✨ Начать обучение
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
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

function openCategory(id) {
    window.location.href = `/tasks?category=${id}`;
}

document.addEventListener("DOMContentLoaded", loadCategories);
