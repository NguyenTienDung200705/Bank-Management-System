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
  Autocomplete,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from "@mui/material";
import { customerApi, savingApi, interestApi } from "../../api";
import { SAVING_TYPE_LABELS } from "../../utils/labels";

export default function OpenSavingDialog({ open, onClose, onSuccess }) {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [savingType, setSavingType] = useState("TERM_12M");
  const [amount, setAmount] = useState("");
  const [autoRenew, setAutoRenew] = useState(false);
  const [rates, setRates] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCustomer(null);
      setSavingType("TERM_12M");
      setAmount("");
      setAutoRenew(false);
      setError("");
      interestApi.list({ category: "SAVING" }).then((res) => setRates(res.data));
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCustomerLoading(true);
    const timer = setTimeout(() => {
      customerApi
        .list({ page: 1, size: 15, keyword: customerSearch || undefined })
        .then((res) => setCustomerOptions(res.data.items))
        .finally(() => setCustomerLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch, open]);

  const currentRate = rates.find((r) => r.code === savingType)?.rate_percent_per_year;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await savingApi.open({
        customer_id: customer.id,
        saving_type: savingType,
        amount: Number(amount),
        auto_renew: autoRenew,
      });
      onSuccess(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>Mở sổ tiết kiệm mới</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              options={customerOptions}
              getOptionLabel={(o) => `${o.full_name} — ${o.customer_code}`}
              loading={customerLoading}
              value={customer}
              onChange={(e, val) => setCustomer(val)}
              onInputChange={(e, val) => setCustomerSearch(val)}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Khách hàng"
                  required
                  slotProps={{
                    ...params.slotProps,
                    input: {
                      ...params.slotProps.input,
                      endAdornment: (
                        <>
                          {customerLoading && <CircularProgress size={16} />}
                          {params.slotProps.input.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Loại kỳ hạn" fullWidth value={savingType} onChange={(e) => setSavingType(e.target.value)}>
              {Object.entries(SAVING_TYPE_LABELS).map(([code, label]) => (
                <MenuItem key={code} value={code}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Lãi suất áp dụng"
              fullWidth
              disabled
              value={currentRate !== undefined ? `${currentRate}%/năm` : "—"}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Số tiền gửi ban đầu"
              fullWidth
              required
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">VND</InputAdornment> } }}
            />
          </Grid>
          {savingType !== "NO_TERM" && (
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Checkbox checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} />}
                label="Tự động tái tục khi đáo hạn"
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !customer || !amount || Number(amount) <= 0}>
          Mở sổ tiết kiệm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
