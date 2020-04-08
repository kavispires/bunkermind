import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

import useGlobalState from '../useGlobalState';

const Toast = () => {
  // Global States
  const [toast, setToast] = useGlobalState('toast');

  const handleClose = () => {
    setToast({
      ...toast,
      isVisible: false,
    });
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={toast.isVisible}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={toast.severity}>
        {toast.message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
