// Глобальная функция для кнопок
async function updateNavbar() {
    const token = localStorage.getItem("token");
    const loginBtn = document.getElementById("loginBtn");
    const registerBtn = document.getElementById("registerBtn");
    const profileBtn = document.getElementById("profileBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const adminButton = document.getElementById("adminButton");
    const adminBadge = document.getElementById("adminBadge");

    if (token) {
        if (loginBtn) loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";
        if (profileBtn) profileBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        
        // Check if user is admin
        try {
            const user = await API.getCurrentUser();
            if (user.role === "admin") {
                if (adminButton) adminButton.style.display = "inline-block";
                if (adminBadge) adminBadge.style.display = "inline-block";
            }
        } catch (error) {
            console.error("Failed to check user role:", error);
        }
    } else {
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (registerBtn) registerBtn.style.display = "inline-block";
        if (profileBtn) profileBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (adminButton) adminButton.style.display = "none";
        if (adminBadge) adminBadge.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const logoutBtn = document.getElementById("logoutBtn");

    updateNavbar();

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = e.target[0].value;
            const password = e.target[1].value;

            try {
                const result = await API.login(email, password);
                localStorage.setItem("token", result.access_token);
                const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
                modal.hide();
                updateNavbar();
                Notify.success("🌸 С возвращением!");
            } catch (error) {
                Notify.error("Ошибка", error.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = e.target[0].value;
            const password = e.target[1].value;
            const passwordConfirm = e.target[2].value;

            if (password !== passwordConfirm) {
                Notify.warning("Ошибка", "Пароли не совпадают");
                return;
            }

            try {
                await API.register(email, password);
                const result = await API.login(email, password);
                localStorage.setItem("token", result.access_token);
                const modal = bootstrap.Modal.getInstance(document.getElementById("registerModal"));
                modal.hide();
                updateNavbar();
                Notify.success("🎉 Добро пожаловать! Аккаунт успешно создан.");
            } catch (error) {
                Notify.error("Ошибка", error.message);
            }
        });
    }

    function logout() {
        localStorage.removeItem("token");
        updateNavbar();
    }
});
