export const clearRazorpayLocalData = () => {
    Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('rzp_')) {
            localStorage.removeItem(key);
        }
    });
};
