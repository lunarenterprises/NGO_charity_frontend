import { BASE_URL } from "./baseUrl";
import { commonApi } from "./commonApi";

// Admin Send OTP
export const adminSendOtpApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/admin/send-otp`, data, "");
}

// Admin Verify OTP
export const adminVerifyOtpApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/admin/login`, data, "");
}

// Get All Enquiries
export const getAllEnquiriesApi = async (params = {}) => {
    const { page = 1, limit = 10, search = "" } = params;
    const queryString = `?page=${page}&limit=${limit}&search=${search}`;
    return await commonApi("GET", `${BASE_URL}/api/enquiries${queryString}`, "", "");
}

// Get All Users (Admin)
export const getAllUsersApi = async (params = {}) => {
    const { page = 1, limit = 10, search = "" } = params;
    const queryString = `?page=${page}&limit=${limit}&search=${search}`;
    return await commonApi("GET", `${BASE_URL}/api/admin/users${queryString}`, "", "");
}

// Get All Active Projects (Admin)
export const getActiveProjectsApi = async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryString = `?page=${page}&limit=${limit}`;
    return await commonApi("GET", `${BASE_URL}/api/projects/active${queryString}`, "", "");
}

// Get Single Project Details (Admin) — includes projectImages + projectVideo
export const getProjectByIdApi = async (projectId) => {
    return await commonApi("GET", `${BASE_URL}/api/projects/${projectId}`, "", "");
}

// Create Project (Admin)
export const createProjectApi = async (formData) => {
    return await commonApi("PATCH", `${BASE_URL}/api/projects`, formData, { "Content-Type": "multipart/form-data" });
}

// Update Project (Admin)
export const updateProjectApi = async (projectId, formData) => {
    return await commonApi("PATCH", `${BASE_URL}/api/projects/${projectId}`, formData, { "Content-Type": "multipart/form-data" });
}

// Delete Project (Admin)
export const deleteProjectApi = async (projectId) => {
    return await commonApi("DELETE", `${BASE_URL}/api/projects/${projectId}`, null, "");
}

// Mark Project as Completed (Admin)
export const markProjectCompleteApi = async (projectId) => {
    return await commonApi("PATCH", `${BASE_URL}/api/projects/${projectId}/complete`, {}, "");
}

// ── Banners APIs ───────────────────────────────────────────────────

// Upload New Banner (FormData: bannerImage)
export const addBannerApi = async (formData) => {
    return await commonApi("POST", `${BASE_URL}/api/banners`, formData, { "Content-Type": "multipart/form-data" });
}

// Get All Banners (Admin) with pagination
export const getAllBannersApi = async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryString = `?page=${page}&limit=${limit}`;
    return await commonApi("GET", `${BASE_URL}/api/banners${queryString}`, "", "");
}

// Fetch Active Banners (Public)
export const getActiveBannersApi = async () => {
    return await commonApi("GET", `${BASE_URL}/api/banners/active`, "", "");
}

// Toggle Banner Status (Admin)
export const toggleBannerStatusApi = async (bannerId, isActive) => {
    return await commonApi("PATCH", `${BASE_URL}/api/banners/${bannerId}/status`, { isActive }, "");
}

// Delete Banner (Admin)
export const deleteBannerApi = async (bannerId) => {
    return await commonApi("DELETE", `${BASE_URL}/api/banners/${bannerId}`, null, "");
}

// Get All Donations (Admin)
export const getAllDonationsApi = async (params = {}) => {
    const { page = 1, limit = 10, search = "" } = params;
    let queryString = `?page=${page}&limit=${limit}`;
    if (search) queryString += `&search=${search}`;
    return await commonApi("GET", `${BASE_URL}/api/donations/all${queryString}`, "", "");
}

// Get Project Donations (Admin)
export const getProjectDonationsApi = async (projectId, params = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryString = `?page=${page}&limit=${limit}`;
    return await commonApi("GET", `${BASE_URL}/api/donations/project/${projectId}${queryString}`, "", "");
}

// Get User Donations (Admin)
export const getUserDonationsAdminApi = async (userId, params = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryString = `?page=${page}&limit=${limit}`;
    return await commonApi("GET", `${BASE_URL}/api/donations/user/${userId}${queryString}`, "", "");
}

// Get Financial Year Donations (Admin)
export const getFinancialYearDonationsApi = async (params = {}) => {
    const { page = 1, limit = 10, year = "" } = params;
    const queryString = `?page=${page}&limit=${limit}&year=${year}`;
    return await commonApi("GET", `${BASE_URL}/api/donations/financial-year${queryString}`, "", "");
}

// Get Dashboard Stats (Admin)
export const getDashboardStatsApi = async () => {
    return await commonApi("GET", `${BASE_URL}/api/admin/dashboard-stats`, "", "");
}

// ── Chat APIs ──────────────────────────────────────────────────────

// Get Users who have chatted
export const getChatUsersApi = async () => {
    return await commonApi("GET", `${BASE_URL}/api/chat/users`, "", "");
}

// Get Chat History with a User
export const getChatHistoryAdminApi = async (userId) => {
    return await commonApi("GET", `${BASE_URL}/api/chat/history/${userId}`, "", "");
}

// Upload Chat File
export const uploadChatFileAdminApi = async (reqBody, header) => {
    return await commonApi("POST", `${BASE_URL}/api/chat/upload`, reqBody, header);
}

// Mark Chat as Read
export const markChatAsReadApi = async (userId) => {
    return await commonApi("PATCH", `${BASE_URL}/api/chat/mark-read/${userId}`, {}, "");
}
