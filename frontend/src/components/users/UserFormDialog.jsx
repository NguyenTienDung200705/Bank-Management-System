import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, Alert } from "@mui/material";
import { userApi } from "../../api";
import { ROLE_LABELS } from "../../utils/labels";

const EMPTY = { username: "", password: "", full_name: "", email: "", phone: "", address: "", role: "TELLER" };

export default function UserFormDialog({ open, user, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEdit = !!user;

  useEffect(() => {
    if (open) {
      setForm(
        user
          ? {
              username: user.username,
              password: "",
              full_name: user.full_name,
              email: user.email,
              phone: user.phone || "",
              address: user.address || "",
              role: user.role,
            }
          : EMPTY
      );
      setError("");
    }
  }, [open, user]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        await userApi.update(user.id, form);
      } else {
        await userApi.create(form);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>
        {isEdit ? "Cập nhật người dùng" : "Thêm người dùng mới"}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Họ và tên" fullWidth required value={form.full_name} onChange={set("full_name")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Tên đăng nhập"
              fullWidth
              required
              disabled={isEdit}
              value={form.username}
              onChange={set("username")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Email" fullWidth required value={form.email} onChange={set("email")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Số điện thoại" fullWidth value={form.phone} onChange={set("phone")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Vai trò" fullWidth value={form.role} onChange={set("role")}>
              {Object.entries(ROLE_LABELS).map(([code, label]) => (
                <MenuItem key={code} value={code}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {!isEdit && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Mật khẩu ban đầu"
                type="text"
                fullWidth
                placeholder="Mặc định: Bank@12345"
                value={form.password}
                onChange={set("password")}
                helperText="Để trống sẽ dùng mật khẩu mặc định"
              />
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <TextField label="Địa chỉ" fullWidth value={form.address} onChange={set("address")} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button variant="contained" onClick={submit} disabled={loading || !form.full_name || !form.username || !form.email}>
          {isEdit ? "Lưu thay đổi" : "Tạo người dùng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
