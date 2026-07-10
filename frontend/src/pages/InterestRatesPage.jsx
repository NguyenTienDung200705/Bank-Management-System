import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  Grid,
  Chip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import PageHeader from "../components/common/PageHeader";
import { interestApi } from "../api";
import { formatDate } from "../utils/format";
import { useAuth } from "../context/AuthContext";

export default function InterestRatesPage() {
  const { user } = useAuth();
  const [rates, setRates] = useState([]);
  const [editRate, setEditRate] = useState(null);
  const canEdit = user?.role === "ADMIN";

  const load = useCallback(() => {
    interestApi.list().then((res) => setRates(res.data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const savingRates = rates.filter((r) => r.category === "SAVING");
  const loanRates = rates.filter((r) => r.category === "LOAN");

  return (
    <Box>
      <PageHeader title="Cấu hình lãi suất" subtitle="Lãi suất áp dụng cho sản phẩm tiết kiệm và cho vay" />

      <Typography variant="h6" sx={{ mb: 1.5, fontSize: 16 }}>
        Lãi suất tiết kiệm
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {savingRates.map((r) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
            <RateCard rate={r} canEdit={canEdit} onEdit={() => setEditRate(r)} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ mb: 1.5, fontSize: 16 }}>
        Lãi suất cho vay
      </Typography>
      <Grid container spacing={2}>
        {loanRates.map((r) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.id}>
            <RateCard rate={r} canEdit={canEdit} onEdit={() => setEditRate(r)} />
          </Grid>
        ))}
      </Grid>

      <EditRateDialog
        rate={editRate}
        onClose={() => setEditRate(null)}
        onSuccess={() => {
          setEditRate(null);
          load();
        }}
      />
    </Box>
  );
}

function RateCard({ rate, canEdit, onEdit }) {
  return (
    <Card sx={{ p: 2.5, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "8px",
            bgcolor: "primary.dark",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PercentOutlinedIcon sx={{ color: "secondary.main", fontSize: 20 }} />
        </Box>
        {canEdit && (
          <Button size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={onEdit}>
            Sửa
          </Button>
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {rate.label}
      </Typography>
      <Typography
        sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 26, color: "primary.dark" }}
      >
        {rate.rate_percent_per_year}%<Typography component="span" variant="caption"> /năm</Typography>
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
        <Chip size="small" label={rate.is_active ? "Đang áp dụng" : "Ngừng áp dụng"} color={rate.is_active ? "success" : "default"} />
        <Typography variant="caption" color="text.secondary">
          từ {formatDate(rate.effective_from)}
        </Typography>
      </Stack>
    </Card>
  );
}

function EditRateDialog({ rate, onClose, onSuccess }) {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rate) {
      setValue(rate.rate_percent_per_year);
      setActive(rate.is_active);
      setError("");
    }
  }, [rate]);

  if (!rate) return null;

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await interestApi.update(rate.id, { rate_percent_per_year: Number(value), is_active: active });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!rate} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>Cập nhật lãi suất</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {rate.label}
        </Typography>
        <TextField
          label="Lãi suất (%/năm)"
          type="number"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControlLabel control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Đang áp dụng" />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button variant="contained" onClick={submit} disabled={loading}>
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
