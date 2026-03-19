import { BASE_URL } from "./baseUrl";
import { commonApi } from "./commonApi";

// Register user
export const registerApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/user/register`, data, "");
}

// Send OTP
export const sendOtpApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/user/send-otp`, data, "");
}

// Login user (verify OTP)
export const loginApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/user/login`, data, "");
}

// Add Enquiry
export const addEnquiryApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/enquiries`, data, "");
}

// Get Completed Projects
export const getCompletedProjectsApi = async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryString = `?page=${page}&limit=${limit}`;
    return await commonApi("GET", `${BASE_URL}/api/projects/completed${queryString}`, "", "");
}

// Get Active Projects (Public)
export const getActiveProjectsApi = async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryString = `?page=${page}&limit=${limit}`;
    return await commonApi("GET", `${BASE_URL}/api/projects/active${queryString}`, "", "");
}

// Create Quick Donation Order
export const createQuickDonationOrderApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/donations/quick/order`, data, "");
}

// Verify Quick Donation Payment
export const verifyQuickDonationPaymentApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/donations/quick/verify`, data, "");
}

// Create Project Donation Order
export const createProjectDonationOrderApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/donations/project/order`, data, "");
}

// Verify Project Donation Payment
export const verifyProjectDonationPaymentApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/donations/project/verify`, data, "");
}

// Get Project Details by ID
export const getProjectDetailsApi = async (id) => {
    return await commonApi("GET", `${BASE_URL}/api/projects/${id}`, "", "");
}

// Get Current User Profile
export const getUserProfileApi = async () => {
    return await commonApi("GET", `${BASE_URL}/api/user/me`, "", "");
}

// Get Current User Donations
export const getUserDonationsApi = async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryString = `?page=${page}&limit=${limit}`;
    return await commonApi("GET", `${BASE_URL}/api/donations/my${queryString}`, "", "");
}

// Update Current User Profile
export const updateUserProfileApi = async (data) => {
    return await commonApi("PUT", `${BASE_URL}/api/user/me`, data, "");
}

// Enroll as Monthly Donor
export const enrollAsMonthlyDonorApi = async () => {
    return await commonApi("POST", `${BASE_URL}/api/monthly-donor/enroll`, "", "");
}

// Create Monthly Donation Order
export const createMonthlyDonationOrderApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/monthly-donor/order`, data, "");
}

// Verify Monthly Donation Payment
export const verifyMonthlyDonationPaymentApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/monthly-donor/verify`, data, "");
}

// Create Bulk Monthly Donation Order
export const createBulkMonthlyDonationOrderApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/monthly-donor/bulk-order`, data, "");
}

// Verify Bulk Monthly Donation Payment
export const verifyBulkMonthlyDonationPaymentApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/api/monthly-donor/bulk-verify`, data, "");
}

// Get Monthly Donor Status
export const getMonthlyDonorStatusApi = async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const queryString = `?page=${page}&limit=${limit}`;
    return await commonApi("GET", `${BASE_URL}/api/monthly-donor/my-status${queryString}`, "", "");
}

// Get Current User Financial Year Donations
export const getUserFinancialYearTransactionsApi = async () => {
    return await commonApi("GET", `${BASE_URL}/api/donations/my-financial-year`, "", "");
}

// ── Chat APIs ──────────────────────────────────────────────────────

// Get Chat History with Admin (assuming admin ID is known or backend handles generic 'admin' target)
export const getChatHistoryUserApi = async (adminId = 1) => { 
    // Usually the backend can handle an 'admin' identifier or we pass a specific admin ID. 
    // We'll pass 1 for now or whatever ID represents the support admin.
    return await commonApi("GET", `${BASE_URL}/api/chat/history/${adminId}`, "", "");
}

// Upload Chat File
export const uploadChatFileUserApi = async (reqBody, header) => {
    return await commonApi("POST", `${BASE_URL}/api/chat/upload`, reqBody, header);
}

// Delete Chat Message
export const deleteChatMessageUserApi = async (messageId) => {
    return await commonApi("DELETE", `${BASE_URL}/api/chat/${messageId}`, "", "");
}
