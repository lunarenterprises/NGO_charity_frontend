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

// Get Project Details by ID
export const getProjectDetailsApi = async (id) => {
    return await commonApi("GET", `${BASE_URL}/api/projects/${id}`, "", "");
}
