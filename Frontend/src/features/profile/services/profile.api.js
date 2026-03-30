import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
});

export const createProfile = async (payload) => {
    const response = await api.post("/api/profile", payload);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get("/api/profile");
    return response.data;
};

export const updateProfile = async (payload) => {
    const response = await api.put("/api/profile", payload);
    return response.data;
};
