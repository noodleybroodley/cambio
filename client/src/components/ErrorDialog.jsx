import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { ClientEvent } from 'clientevent';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

export default function ErrorDialog() {
  const [open, setOpen] = React.useState(false);
  const [error,setError] = React.useState({type: undefined, message: undefined})

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const openSub = ClientEvent.subscribe('error', (err) => {
      setError(err);
	  setOpen(true);
    })

    return () => {
      openSub.unsubscribe();
    }
  }, [])

  return (
    <div>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          {`${error.type}:`}
        </BootstrapDialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
            	{error.message}
            </Typography>
          </DialogContent>
      </BootstrapDialog>
    </div>
  );
}