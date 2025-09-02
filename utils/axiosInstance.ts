import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "/api",
});

const isExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
};

// Request Interceptor – attach fresh token
axiosInstance.interceptors.request.use(async (config) => {
    if (typeof window === "undefined") return config;
const publicPaths = ["/auth/login", "/auth/register", "/send-alert-email"];
    const isPublic = publicPaths.some((path) => config.url?.includes(path));

    if (isPublic) return config;
    let accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // Refresh token if access token is expired
    if(!accessToken){
    return config;
    }
    if (isExpired(accessToken) && refreshToken && !isExpired(refreshToken)) {
        try {
            const res = await axios.get("/auth/refresh", {
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            });
            const data = res.data;
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refresh_token);
            accessToken = data.access_token;
        } catch (err) {
            console.error("Token refresh failed:", err);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        }
    }

    if (accessToken) {
        config.headers = config.headers;
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});

export default axiosInstance;