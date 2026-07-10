import { useState } from "react";
import { Box, Card, Grid, TextField, Button, Alert, Avatar, Typography, Stack, Chip } from "@mui/material";
import PageHeader from "../components/common/PageHeader";
import { authApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../utils/labels";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.data);
      setMessage("Cập nhật hồ sơ thành công.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Hồ sơ cá nhân" subtitle="Thông tin tài khoản của bạn" />

      <Card sx={{ p: 3, maxWidth: 640 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.dark", fontSize: 26 }}>
            {user?.full_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontSize: 18 }}>
              {user?.full_name}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Chip size="small" label={ROLE_LABELS[user?.role]} />
              <Chip size="small" label={user?.username} variant="outlined" />
            </Stack>
          </Box>
        </Stack>

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

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Email" fullWidth value={form.email} onChange={set("email")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Số điện thoại" fullWidth value={form.phone} onChange={set("phone")} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Địa chỉ" fullWidth value={form.address} onChange={set("address")} />
          </Grid>
        </Grid>

        <Button variant="contained" sx={{ mt: 3 }} onClick={submit} disabled={loading}>
          Lưu thay đổi
        </Button>
      </Card>
    </Box>
  );
}
