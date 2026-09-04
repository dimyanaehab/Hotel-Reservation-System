window.hotelApi = {
    baseUrl: "http://localhost:5007/api",

    headers(role = "User") {
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        if (token && !token.startsWith("demo-token-")) {
            return { Authorization: `Bearer ${token}` };
        }

        return {
            "X-Test-User-Id": "1",
            "X-Test-Role": role
        };
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
