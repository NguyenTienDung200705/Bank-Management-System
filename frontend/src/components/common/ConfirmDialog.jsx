import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

export default function ConfirmDialog({
  open,
  title = "Xác nhận",
  content,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmColor = "primary",
  loading,
  onConfirm,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} disabled={loading}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
