import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";
import { customerApi } from "../../api";

const EMPTY = {
  full_name: "",
  citizen_id: "",
  date_of_birth: "",
  gender: "OTHER",
  phone: "",
  email: "",
  address: "",
  occupation: "",
};

export default function CustomerFormDialog({ open, onClose, onSuccess, customer }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isEdit = !!customer;

  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? {
              full_name: customer.full_name || "",
              citizen_id: customer.citizen_id || "",
              date_of_birth: customer.date_of_birth || "",
              gender: customer.gender || "OTHER",
              phone: customer.phone || "",
              email: customer.email || "",
              address: customer.address || "",
              occupation: customer.occupation || "",
            }
          : EMPTY
      );
      setError("");
    }
  }, [open, customer]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        await customerApi.update(customer.id, form);
      } else {
        await customerApi.create(form);
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
        {isEdit ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField label="Họ và tên" fullWidth required value={form.full_name} onChange={set("full_name")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              label="Số CCCD/CMND"
              fullWidth
              required
              disabled={isEdit}
              value={form.citizen_id}
              onChange={set("citizen_id")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Ngày sinh"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.date_of_birth}
              onChange={set("date_of_birth")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Giới tính" fullWidth value={form.gender} onChange={set("gender")}>
              <MenuItem value="MALE">Nam</MenuItem>
              <MenuItem value="FEMALE">Nữ</MenuItem>
              <MenuItem value="OTHER">Khác</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Số điện thoại" fullWidth required value={form.phone} onChange={set("phone")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Email" fullWidth value={form.email} onChange={set("email")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Nghề nghiệp" fullWidth value={form.occupation} onChange={set("occupation")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Địa chỉ" fullWidth value={form.address} onChange={set("address")} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !form.full_name || !form.citizen_id || !form.phone}
        >
          {isEdit ? "Lưu thay đổi" : "Tạo khách hàng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
