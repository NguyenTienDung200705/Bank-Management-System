import { useState } from "react";
import { Box, TextField, InputAdornment, MenuItem, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import StatusChip from "../components/common/StatusChip";
import usePagedList from "../utils/usePagedList";
import { transactionApi } from "../api";
import { formatCurrency, formatDateTime, formatDate } from "../utils/format";
import { TRANSACTION_TYPE_META } from "../utils/labels";

export default function TransactionsPage() {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [receiptTx, setReceiptTx] = useState(null);

  const { rows, loading, page, setPage, size, setSize, totalItems } = usePagedList(
    (pg) => transactionApi.list({ ...pg, keyword: keyword || undefined, type: type || undefined }),
    [keyword, type]
  );

  const columns = [
    { key: "receipt_no", label: "Số biên lai" },
    { key: "type", label: "Loại giao dịch", render: (r) => <StatusChip meta={TRANSACTION_TYPE_META} status={r.type} /> },
    { key: "customer", label: "Khách hàng", render: (r) => r.customer?.full_name },
    { key: "reference_code", label: "Tham chiếu" },
    { key: "amount", label: "Số tiền", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.amount)}</span> },
    { key: "transaction_date", label: "Thời gian", render: (r) => formatDateTime(r.transaction_date) },
  ];

  return (
    <Box>
      <PageHeader title="Nhật ký giao dịch" subtitle="Toàn bộ giao dịch tiền gửi, rút tiền, giải ngân và thu nợ" />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <TextField
          placeholder="Tìm theo số biên lai / mã tham chiếu..."
          size="small"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          sx={{ width: 300 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Loại giao dịch"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          sx={{ width: 220 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {Object.entries(TRANSACTION_TYPE_META).map(([k, v]) => (
            <MenuItem key={k} value={k}>
              {v.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        page={page}
        size={size}
        totalItems={totalItems}
        onPageChange={setPage}
        onSizeChange={setSize}
        onRowClick={(row) => setReceiptTx(row)}
        emptyText="Chưa có giao dịch nào."
      />

      <ReceiptDialog tx={receiptTx} onClose={() => setReceiptTx(null)} />
    </Box>
  );
}

function ReceiptDialog({ tx, onClose }) {
  if (!tx) return null;
  return (
    <Dialog open={!!tx} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>Biên lai giao dịch</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography sx={{ fontFamily: '"Source Serif 4", serif', fontWeight: 700, color: "primary.dark" }}>
            VietTrust Bank
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Biên lai giao dịch điện tử
          </Typography>
        </Box>
        <Divider sx={{ mb: 2, borderStyle: "dashed" }} />
        <Row label="Số biên lai" value={tx.receipt_no} />
        <Row label="Loại giao dịch" value={<StatusChip meta={TRANSACTION_TYPE_META} status={tx.type} />} />
        <Row label="Khách hàng" value={tx.customer?.full_name} />
        <Row label="Mã tham chiếu" value={tx.reference_code} />
        <Row label="Mô tả" value={tx.description} />
        <Row label="Thời gian" value={formatDateTime(tx.transaction_date)} />
        <Divider sx={{ my: 2, borderStyle: "dashed" }} />
        <Row
          label="Số tiền"
          value={
            <Typography className="mono-amount" fontWeight={700} fontSize={18}>
              {formatCurrency(tx.amount)}
            </Typography>
          }
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }} className="no-print">
        <Button onClick={onClose} color="inherit">
          Đóng
        </Button>
        <Button variant="contained" startIcon={<PrintOutlinedIcon />} onClick={() => window.print()}>
          In biên lai
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}
