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
  InputAdornment,
  Typography,
} from "@mui/material";
import { customerApi, loanApi, interestApi } from "../../api";
import { LOAN_TYPE_LABELS } from "../../utils/labels";
import { formatCurrency } from "../../utils/format";

export default function ApplyLoanDialog({ open, onClose, onSuccess }) {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [loanType, setLoanType] = useState("PERSONAL");
  const [principal, setPrincipal] = useState("");
  const [termMonths, setTermMonths] = useState(12);
  const [purpose, setPurpose] = useState("");
  const [rates, setRates] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCustomer(null);
      setLoanType("PERSONAL");
      setPrincipal("");
      setTermMonths(12);
      setPurpose("");
      setError("");
      interestApi.list({ category: "LOAN" }).then((res) => setRates(res.data));
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

  const currentRate = rates.find((r) => r.code === loanType)?.rate_percent_per_year;

  const estimatedMonthly =
    principal && termMonths ? Number(principal) / Number(termMonths) + (Number(principal) * (currentRate || 0)) / 100 / 12 : null;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await loanApi.apply({
        customer_id: customer.id,
        loan_type: loanType,
        principal: Number(principal),
        term_months: Number(termMonths),
        purpose,
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
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>Đăng ký khoản vay mới</DialogTitle>
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
                  label="Khách hàng vay"
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
            <TextField select label="Loại vay" fullWidth value={loanType} onChange={(e) => setLoanType(e.target.value)}>
              {Object.entries(LOAN_TYPE_LABELS).map(([code, label]) => (
                <MenuItem key={code} value={code}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Lãi suất áp dụng" fullWidth disabled value={currentRate !== undefined ? `${currentRate}%/năm` : "—"} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Số tiền vay"
              fullWidth
              required
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">VND</InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Kỳ hạn (tháng)"
              fullWidth
              required
              type="number"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField label="Mục đích vay" fullWidth multiline rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </Grid>
          {estimatedMonthly && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                Ước tính trả kỳ đầu: <b>{formatCurrency(estimatedMonthly)}</b> /tháng (dư nợ giảm dần)
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !customer || !principal || !termMonths}
        >
          Gửi hồ sơ vay
        </Button>
      </DialogActions>
    </Dialog>
  );
}
