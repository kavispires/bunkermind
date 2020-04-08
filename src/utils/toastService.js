const toastService = {
  error(toast, message) {
    return { ...toast, isVisible: true, severity: 'error', message };
  },
  info(toast, message) {
    return { ...toast, isVisible: true, severity: 'info', message };
  },
  success(toast, message) {
    return { ...toast, isVisible: true, severity: 'success', message };
  },
  warning(toast, message) {
    return { ...toast, isVisible: true, severity: 'warning', message };
  },
};

export default toastService;
