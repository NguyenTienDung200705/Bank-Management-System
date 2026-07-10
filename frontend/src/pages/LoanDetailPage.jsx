import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Grid,
  Typography,
  Stack,
  IconButton,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import DataTable from "../components/common/DataTable";
import StatusChip from "../components/common/StatusChip";
import { loanApi } from "../api";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import { LOAN_STATUS_META, LOAN_TYPE_LABELS, SCHEDULE_STATUS_META } from "../utils/labels";
import { useAuth } from "../context/AuthContext";

export default function LoanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loan, setLoan] = useState(null);
  const [tab, setTab] = useState(0);
  const [dialog, setDialog] = useState(null); // approve|reject|disburse|repay|settle

  const load = useCallback(() => {
    loanApi.getById(id).then((res) => setLoan(res.data));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!loan) return null;

  const canManage = ["ADMIN", "LOAN_OFFICER"].includes(user?.role);
  const canRepay = ["ADMIN", "TELLER", "LOAN_OFFICER"].includes(user?.role);
  const progress = loan.principal > 0 ? ((loan.principal - loan.outstanding_principal) / loan.principal) * 100 : 0;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton onClick={() => navigate("/loans")} size="small">
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Quay lại danh sách khoản vay
        </Typography>
      </Stack>

      <Card sx={{ p: 3, mb: 3, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", bgcolor: "primary.dark" }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h5" sx={{ color: "primary.dark" }}>
                {loan.loan_code}
              </Typography>
              <StatusChip meta={LOAN_STATUS_META} status={loan.status} />
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2, cursor: "pointer" }}
              onClick={() => navigate(`/customers/${loan.customer_id}`)}
            >
              <PersonOutlineIcon fontSize="small" color="action" />
              <Typography variant="body2" color="primary.main" fontWeight={600}>
                {loan.customer?.full_name} ({loan.customer?.customer_code})
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <InfoItem label="Loại vay" value={LOAN_TYPE_LABELS[loan.loan_type]} />
              <InfoItem label="Lãi suất" value={`${loan.interest_rate}%/năm`} />
              <InfoItem label="Kỳ hạn" value={`${loan.term_months} tháng`} />
              <InfoItem label="Ngày đăng ký" value={formatDate(loan.applied_date)} />
              <InfoItem label="Ngày giải ngân" value={loan.disbursed_date ? formatDate(loan.disbursed_date) : "—"} />
              <InfoItem label="Mục đích vay" value={loan.purpose || "—"} />
            </Grid>

            {loan.reject_reason && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Lý do từ chối: {loan.reject_reason}
              </Alert>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ bgcolor: "#F8F7F2", borderRadius: 2, p: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                DƯ NỢ CÒN LẠI
              </Typography>
              <Typography
                sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 26, color: "primary.dark", my: 0.5 }}
              >
                {formatCurrency(loan.outstanding_principal)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                trên tổng số tiền vay {formatCurrency(loan.principal)}
              </Typography>
              {["DISBURSED", "OVERDUE", "SETTLED"].includes(loan.status) && (
                <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, mt: 1.5 }} />
              )}
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
              {loan.status === "PENDING" && canManage && (
                <>
                  <Button size="small" variant="contained" color="success" startIcon={<CheckCircleOutlineIcon />} onClick={() => setDialog("approve")}>
                    Duyệt hồ sơ
                  </Button>
                  <Button size="small" variant="outlined" color="error" startIcon={<CancelOutlinedIcon />} onClick={() => setDialog("reject")}>
                    Từ chối
                  </Button>
                </>
              )}
              {loan.status === "APPROVED" && canManage && (
                <Button size="small" variant="contained" startIcon={<PaidOutlinedIcon />} onClick={() => setDialog("disburse")}>
                  Giải ngân
                </Button>
              )}
              {["DISBURSED", "OVERDUE"].includes(loan.status) && canRepay && (
                <>
                  <Button size="small" variant="contained" color="secondary" startIcon={<PaymentsOutlinedIcon />} onClick={() => setDialog("repay")}>
                    Thu nợ
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<TaskAltIcon />} onClick={() => setDialog("settle")}>
                    Tất toán sớm
                  </Button>
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Lịch trả nợ" />
        <Tab label="Lịch sử thanh toán" />
      </Tabs>

      {tab === 0 && (
        <DataTable
          columns={[
            { key: "period_no", label: "Kỳ" },
            { key: "due_date", label: "Ngày đến hạn", render: (r) => formatDate(r.due_date) },
            { key: "principal_due", label: "Gốc", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.principal_due)}</span> },
            { key: "interest_due", label: "Lãi", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.interest_due)}</span> },
            { key: "penalty_due", label: "Phạt", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.penalty_due)}</span> },
            { key: "total_due", label: "Tổng phải trả", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.total_due)}</span> },
            { key: "amount_paid", label: "Đã trả", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.amount_paid)}</span> },
            { key: "status", label: "Trạng thái", render: (r) => <StatusChip meta={SCHEDULE_STATUS_META} status={r.status} /> },
          ]}
          rows={loan.schedules || []}
          loading={false}
          emptyText="Chưa có lịch trả nợ (khoản vay chưa giải ngân)."
        />
      )}

      {tab === 1 && (
        <DataTable
          columns={[
            { key: "payment_date", label: "Ngày thanh toán", render: (r) => formatDate(r.payment_date) },
            { key: "principal_paid", label: "Gốc trả", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.principal_paid)}</span> },
            { key: "interest_paid", label: "Lãi trả", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.interest_paid)}</span> },
            { key: "penalty_paid", label: "Phạt trả", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.penalty_paid)}</span> },
            { key: "total_paid", label: "Tổng trả", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.total_paid)}</span> },
            { key: "note", label: "Ghi chú" },
          ]}
          rows={loan.repayments || []}
          loading={false}
          emptyText="Chưa có lịch sử thanh toán."
        />
      )}

      <LoanActionDialogs dialog={dialog} loan={loan} onClose={() => setDialog(null)} onSuccess={() => { setDialog(null); load(); }} />
    </Box>
  );
}

function InfoItem({ label, value }) {
  return (
    <Grid size={{ xs: 6 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Grid>
  );
}

function LoanActionDialogs({ dialog, loan, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setReason("");
    setAmount("");
    setNote("");
    setError("");
    setResult(null);
  }, [dialog]);

  if (!dialog) return null;

  const nextSchedule = (loan.schedules || []).find((s) => ["PENDING", "OVERDUE", "PARTIAL"].includes(s.status));

  const run = async (fn) => {
    setLoading(true);
    setError("");
    try {
      const res = await fn();
      if (dialog === "repay" || dialog === "settle") {
        setResult(res.data);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    approve: "Duyệt khoản vay",
    reject: "Từ chối khoản vay",
    disburse: "Giải ngân khoản vay",
    repay: "Thu nợ khoản vay",
    settle: "Tất toán sớm khoản vay",
  };

  return (
    <Dialog open={!!dialog} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>{titles[dialog]}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {dialog === "repay"
              ? `Thu nợ thành công: ${formatCurrency(result.principalPortion + result.interestPortion + result.penaltyPortion)}`
              : `Tất toán thành công: ${formatCurrency(result.totalSettleAmount)}`}
          </Alert>
        )}

        {!result && dialog === "approve" && (
          <Typography variant="body2" color="text.secondary">
            Xác nhận duyệt hồ sơ vay <b>{loan.loan_code}</b> với số tiền {formatCurrency(loan.principal)}?
          </Typography>
        )}

        {!result && dialog === "reject" && (
          <TextField
            label="Lý do từ chối"
            fullWidth
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        )}

        {!result && dialog === "disburse" && (
          <Typography variant="body2" color="text.secondary">
            Xác nhận giải ngân {formatCurrency(loan.principal)} cho khách hàng <b>{loan.customer?.full_name}</b>. Hệ
            thống sẽ tự động sinh lịch trả nợ {loan.term_months} kỳ.
          </Typography>
        )}

        {!result && dialog === "repay" && (
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {nextSchedule ? (
              <Alert severity="info">
                Kỳ tiếp theo: <b>Kỳ {nextSchedule.period_no}</b> — Còn phải trả{" "}
                <b>{formatCurrency(nextSchedule.total_due + nextSchedule.penalty_due - nextSchedule.amount_paid)}</b>
              </Alert>
            ) : (
              <Alert severity="warning">Khoản vay đã tất toán toàn bộ lịch trả nợ.</Alert>
            )}
            <TextField
              label="Số tiền thanh toán"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">VND</InputAdornment> } }}
            />
            <TextField label="Ghi chú (tùy chọn)" fullWidth value={note} onChange={(e) => setNote(e.target.value)} />
          </Stack>
        )}

        {!result && dialog === "settle" && (
          <Typography variant="body2" color="text.secondary">
            Tất toán toàn bộ dư nợ còn lại ({formatCurrency(loan.outstanding_principal)}) và các kỳ lãi/phạt chưa
            thanh toán trong một lần.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={result ? onSuccess : onClose} color="inherit">
          {result ? "Đóng" : "Hủy"}
        </Button>
        {!result && dialog === "approve" && (
          <Button variant="contained" color="success" disabled={loading} onClick={() => run(() => loanApi.approve(loan.id))}>
            Xác nhận duyệt
          </Button>
        )}
        {!result && dialog === "reject" && (
          <Button variant="contained" color="error" disabled={loading || !reason} onClick={() => run(() => loanApi.reject(loan.id, { reason }))}>
            Xác nhận từ chối
          </Button>
        )}
        {!result && dialog === "disburse" && (
          <Button variant="contained" disabled={loading} onClick={() => run(() => loanApi.disburse(loan.id))}>
            Xác nhận giải ngân
          </Button>
        )}
        {!result && dialog === "repay" && (
          <Button
            variant="contained"
            color="secondary"
            disabled={loading || !amount || Number(amount) <= 0 || !nextSchedule}
            onClick={() => run(() => loanApi.repay(loan.id, { amount: Number(amount), note }))}
          >
            Xác nhận thu nợ
          </Button>
        )}
        {!result && dialog === "settle" && (
          <Button variant="contained" disabled={loading} onClick={() => run(() => loanApi.settle(loan.id))}>
            Xác nhận tất toán
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
