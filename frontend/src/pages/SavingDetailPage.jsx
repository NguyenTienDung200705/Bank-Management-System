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
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import DataTable from "../components/common/DataTable";
import StatusChip from "../components/common/StatusChip";
import { savingApi } from "../api";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import { SAVING_STATUS_META, SAVING_TYPE_LABELS } from "../utils/labels";
import { useAuth } from "../context/AuthContext";

const TX_TYPE_LABEL = {
  DEPOSIT: "Gửi tiền",
  WITHDRAW: "Rút tiền",
  INTEREST_CREDIT: "Ghi nhận lãi",
  CLOSE: "Tất toán",
  RENEW: "Tái tục",
};

export default function SavingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [actionDialog, setActionDialog] = useState(null); // 'deposit' | 'withdraw' | 'close' | 'renew'
  const [error, setError] = useState("");

  const load = useCallback(() => {
    savingApi.getById(id).then((res) => setAccount(res.data));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!account) return null;

  const canOperate = ["ADMIN", "TELLER"].includes(user?.role) && account.status === "ACTIVE";

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton onClick={() => navigate("/savings")} size="small">
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Quay lại danh sách tiết kiệm
        </Typography>
      </Stack>

      <Card sx={{ p: 3, mb: 3, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", bgcolor: "secondary.main" }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h5" sx={{ color: "primary.dark" }}>
                {account.saving_code}
              </Typography>
              <StatusChip meta={SAVING_STATUS_META} status={account.status} />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, cursor: "pointer" }} onClick={() => navigate(`/customers/${account.customer_id}`)}>
              <PersonOutlineIcon fontSize="small" color="action" />
              <Typography variant="body2" color="primary.main" fontWeight={600}>
                {account.customer?.full_name} ({account.customer?.customer_code})
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <InfoItem label="Loại kỳ hạn" value={SAVING_TYPE_LABELS[account.saving_type]} />
              <InfoItem label="Lãi suất" value={`${account.interest_rate}%/năm`} />
              <InfoItem label="Ngày mở sổ" value={formatDate(account.open_date)} />
              <InfoItem label="Ngày đáo hạn" value={account.maturity_date ? formatDate(account.maturity_date) : "Không kỳ hạn"} />
              <InfoItem label="Gốc ban đầu" value={formatCurrency(account.principal)} mono />
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ bgcolor: "#F8F7F2", borderRadius: 2, p: 2.5, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                SỐ DƯ HIỆN TẠI
              </Typography>
              <Typography
                sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 30, color: "primary.dark", my: 0.5 }}
              >
                {formatCurrency(account.balance)}
              </Typography>
            </Box>

            {canOperate && (
              <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                <Button size="small" variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => setActionDialog("deposit")}>
                  Gửi tiền
                </Button>
                <Button size="small" variant="outlined" startIcon={<RemoveCircleOutlineIcon />} onClick={() => setActionDialog("withdraw")}>
                  Rút tiền
                </Button>
                {account.term_months > 0 && (
                  <Button size="small" variant="outlined" color="secondary" startIcon={<AutorenewIcon />} onClick={() => setActionDialog("renew")}>
                    Tái tục
                  </Button>
                )}
                <Button size="small" variant="outlined" color="error" startIcon={<TaskAltIcon />} onClick={() => setActionDialog("close")}>
                  Tất toán
                </Button>
              </Stack>
            )}
          </Grid>
        </Grid>
      </Card>

      <Typography variant="h6" sx={{ mb: 1.5, fontSize: 16 }}>
        Lịch sử giao dịch
      </Typography>
      <DataTable
        columns={[
          { key: "type", label: "Loại", render: (r) => <Chip size="small" label={TX_TYPE_LABEL[r.type] || r.type} /> },
          { key: "amount", label: "Số tiền", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.amount)}</span> },
          { key: "balance_after", label: "Số dư sau GD", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.balance_after)}</span> },
          { key: "note", label: "Ghi chú" },
          { key: "created_at", label: "Thời gian", render: (r) => formatDateTime(r.createdAt) },
        ]}
        rows={account.transactions || []}
        loading={false}
        emptyText="Chưa có giao dịch nào."
      />

      <AmountActionDialog
        type={actionDialog === "deposit" || actionDialog === "withdraw" ? actionDialog : null}
        account={account}
        onClose={() => setActionDialog(null)}
        onSuccess={() => {
          setActionDialog(null);
          load();
        }}
      />
      <CloseSavingDialog
        open={actionDialog === "close"}
        account={account}
        onClose={() => setActionDialog(null)}
        onSuccess={() => {
          setActionDialog(null);
          load();
        }}
      />
      <RenewSavingDialog
        open={actionDialog === "renew"}
        account={account}
        onClose={() => setActionDialog(null)}
        onSuccess={() => {
          setActionDialog(null);
          load();
        }}
      />
    </Box>
  );
}

function InfoItem({ label, value, mono }) {
  return (
    <Grid size={{ xs: 6 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} className={mono ? "mono-amount" : ""}>
        {value}
      </Typography>
    </Grid>
  );
}

function AmountActionDialog({ type, account, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type) {
      setAmount("");
      setNote("");
      setError("");
    }
  }, [type]);

  if (!type) return null;
  const isDeposit = type === "deposit";

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      if (isDeposit) {
        await savingApi.deposit(account.id, { amount: Number(amount), note });
      } else {
        await savingApi.withdraw(account.id, { amount: Number(amount), note });
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!type} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>{isDeposit ? "Gửi tiền vào sổ" : "Rút tiền từ sổ"}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Số dư hiện tại: <b className="mono-amount">{formatCurrency(account.balance)}</b>
          </Typography>
          <TextField
            label="Số tiền"
            type="number"
            fullWidth
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            slotProps={{ input: { endAdornment: <InputAdornment position="end">VND</InputAdornment> } }}
          />
          <TextField label="Ghi chú (tùy chọn)" fullWidth value={note} onChange={(e) => setNote(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button variant="contained" onClick={submit} disabled={loading || !amount || Number(amount) <= 0}>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CloseSavingDialog({ open, account, onClose, onSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (open) {
      setError("");
      setResult(null);
    }
  }, [open]);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await savingApi.close(account.id, {});
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>Tất toán sổ tiết kiệm</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {result ? (
          <Alert severity="success" icon={<TaskAltIcon />}>
            Tất toán thành công. Lãi được cộng: <b>{formatCurrency(result.interest)}</b>
            {result.penalty > 0 && (
              <>
                <br />
                Phạt rút trước hạn: <b>{formatCurrency(result.penalty)}</b>
              </>
            )}
            <br />
            Tổng chi trả: <b>{formatCurrency(result.totalPayout)}</b>
          </Alert>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {account.term_months > 0
              ? "Nếu tất toán trước ngày đáo hạn, khách hàng sẽ chịu phạt lãi suất không kỳ hạn thay vì lãi suất kỳ hạn đầy đủ."
              : "Toàn bộ số dư và lãi phát sinh sẽ được chi trả cho khách hàng."}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={result ? onSuccess : onClose} color="inherit">
          {result ? "Đóng" : "Hủy"}
        </Button>
        {!result && (
          <Button variant="contained" color="error" onClick={submit} disabled={loading}>
            Xác nhận tất toán
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function RenewSavingDialog({ open, account, onClose, onSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await savingApi.renew(account.id);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>Tái tục sổ tiết kiệm</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="body2" color="text.secondary">
          Lãi đáo hạn sẽ được nhập vào gốc và sổ sẽ được gia hạn thêm {account?.term_months} tháng với lãi suất hiện hành.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button variant="contained" color="secondary" onClick={submit} disabled={loading}>
          Xác nhận tái tục
        </Button>
      </DialogActions>
    </Dialog>
  );
}
