window.hotelApi = {
    baseUrl: "http://localhost:5007/api",

    headers() {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    },

    async errorMessage(response, fallback) {
        try {
            const body = await response.json();
            return body.message || body.title || fallback;
        } catch {
            return fallback;
        }
    }
};
