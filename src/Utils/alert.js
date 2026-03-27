import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

const themeConfig = {
    background: '#ffffff',
    color: '#000000',
    confirmButtonColor: '#000000',
    cancelButtonColor: '#ffffff',
    customClass: {
        popup: 'rounded-none border-2 border-black shadow-2xl',
        confirmButton: 'bg-black text-white rounded-none px-10 py-4 font-bold uppercase tracking-widest text-[10px] m-2 hover:bg-gray-900 transition-all',
        cancelButton: 'bg-white text-black rounded-none px-10 py-4 font-bold uppercase tracking-widest text-[10px] m-2 border-2 border-black hover:bg-black hover:text-white transition-all',
        title: 'text-2xl font-black italic uppercase tracking-tighter',
        htmlContainer: 'text-sm font-medium text-gray-600'
    },
    buttonsStyling: false,
    scrollbarPadding: false
};

export const showAlert = (title, text, icon = 'success') => {
    let iconColor = '#000000'; // Default black
    if (icon === 'error') iconColor = '#ef4444'; // Red
    if (icon === 'warning') iconColor = '#f59e0b'; // Amber
    if (icon === 'info') iconColor = '#000000'; // Black

    return Swal.fire({
        ...themeConfig,
        title,
        text,
        icon,
        iconColor,
    });
};

export const showToast = (title, icon = 'success') => {
    Toast.fire({
        icon,
        title,
        background: '#ffffff',
        color: '#000000',
        iconColor: '#000000',
        customClass: {
            popup: 'rounded-2xl shadow-xl border border-gray-100'
        }
    });
};

export const showConfirm = (title, text) => {
    return Swal.fire({
        ...themeConfig,
        title,
        text,
        icon: 'question',
        iconColor: '#000000',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
    });
};
