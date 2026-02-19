import axios from "axios";

export const commonApi = async (httpRequest, url, reqBody, reqHeader) => {
    let headers = reqHeader || { "Content-Type": "application/json" };

    // Handle case if reqHeader was passed as string (e.g. content-type) just in case, though standard is object
    if (typeof headers === 'string') {
        headers = { "Content-Type": headers };
    }

    const token = sessionStorage.getItem("token");
    if (token) {
        headers = { ...headers, "Authorization": `Bearer ${token}` };
    }

    const reqConfig = {
        method: httpRequest,
        url: url,
        data: reqBody,
        headers: headers
    };

    // Automatically omit Content-Type for FormData to let browser set it with boundary
    if (reqBody instanceof FormData) {
        if (reqConfig.headers["Content-Type"]) {
            delete reqConfig.headers["Content-Type"];
        }
    }

    return await axios(reqConfig).then((result) => {
        return result;
    }).catch((err) => {
        return err;
    });
}