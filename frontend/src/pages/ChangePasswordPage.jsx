import { useState } from "react";
import { Box, Card, TextField, Button, Alert, Stack } from "@mui/material";
import PageHeader from "../components/common/PageHeader";
import { authApi } from "../api";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await authApi.changePassword(form);
      setMessage("Đổi mật khẩu thành công.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Đổi mật khẩu" subtitle="Cập nhật mật khẩu đăng nhập của bạn" />

      <Card sx={{ p: 3, maxWidth: 480 }}>
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2}>
          <TextField
            label="Mật khẩu hiện tại"
            type="password"
            fullWidth
            value={form.currentPassword}
            onChange={set("currentPassword")}
          />
          <TextField
            label="Mật khẩu mới"
            type="password"
            fullWidth
            helperText="Tối thiểu 8 ký tự"
            value={form.newPassword}
            onChange={set("newPassword")}
          />
          <TextField
            label="Xác nhận mật khẩu mới"
            type="password"
            fullWidth
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
          />
        </Stack>
        <Button
          variant="contained"
          sx={{ mt: 3 }}
          onClick={submit}
          disabled={loading || !form.currentPassword || !form.newPassword || !form.confirmPassword}
        >
          Đổi mật khẩu
        </Button>
      </Card>
    </Box>
  );
}
