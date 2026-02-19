import { BASE_URL } from "./baseUrl";
import { commonApi } from "./commonApi";

// Register user
export const registerApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/register`, data, "");
}

// Send OTP
export const sendOtpApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/send-otp`, data, "");
}

// Login user (verify OTP)
export const loginApi = async (data) => {
    return await commonApi("POST", `${BASE_URL}/login`, data, "");
}
