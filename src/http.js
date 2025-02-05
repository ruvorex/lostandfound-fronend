import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
        "Allow-Control-Allow-Origin": "*"
    },
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    let accessToken = localStorage.getItem("token");
    if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // 401 - Unauthorized - Need to login again
    // 403 - Forbidden - User role does not have access to this resource
    // Do something with response error
    if (error.response.status === 401) {
        try {
            if (localStorage.getItem("token")) {
                localStorage.clear();
                alert("Your session has expired. Please login again.");
                window.location("/login");
            }
        } catch (e) {}
    }
    return Promise.reject(error);
});

export default instance;