const SERVER_URL = "http://127.0.0.1:8000";
const API_URL = `${SERVER_URL}/api`;

class Api {
    _authHeaders(contentType = null) {
        const headers = {};
        if (contentType) {
            headers["Content-Type"] = contentType;
        }

        const token = localStorage.getItem("token");
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    }

    async _request(path, { method = "GET", body = null, contentType = null } = {}) {
        const response = await fetch(`${API_URL}${path}`, {
            method,
            headers: this._authHeaders(contentType),
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || "Request failed");
        }

        return response.json().catch(() => null);
    }

    async login(email, password) {
        return this._request("/auth/login", {
            method: "POST",
            body: { email, password },
            contentType: "application/json",
        });
    }

    async register(email, password) {
        return this._request("/auth/register", {
            method: "POST",
            body: { email, password },
            contentType: "application/json",
        });
    }

    async getCategories() {
        return this._request("/categories");
    }

    async getTasksByCategory(categoryId, age) {
        return this._request(`/categories/${categoryId}/tasks?age=${age}`);
    }

    async getProgress() {
        return this._request("/progress");
    }

    async getProfileStats() {
        return this._request("/profile/stats");
    }

    async saveProgress(taskId, isCorrect) {
        return this._request("/progress", {
            method: "POST",
            body: { task_id: taskId, is_correct: isCorrect },
            contentType: "application/json",
        });
    }

    async getCurrentUser() {
        return this._request("/auth/me");
    }

    async getStats() {
        return this._request("/admin/stats");
    }

    async createCategory(name, iconUrl) {
        return this._request("/admin/categories", {
            method: "POST",
            body: { name, icon_url: iconUrl },
            contentType: "application/json",
        });
    }

    async getTasksAdmin() {
        return this._request("/admin/tasks");
    }

    async createTask(taskData) {
        return this._request("/admin/tasks", {
            method: "POST",
            body: taskData,
            contentType: "application/json",
        });
    }

    async deleteCategory(categoryId) {
        return this._request(`/admin/categories/${categoryId}`, { method: "DELETE" });
    }

    async updateTask(taskId, taskData) {
        return this._request(`/admin/tasks/${taskId}`, {
            method: "PUT",
            body: taskData,
            contentType: "application/json",
        });
    }

    async deleteTask(taskId) {
        return this._request(`/admin/tasks/${taskId}`, { method: "DELETE" });
    }
}

const API = new Api();