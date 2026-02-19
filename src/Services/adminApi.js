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
