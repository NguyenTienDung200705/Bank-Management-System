import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, InputAdornment, MenuItem, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import StatusChip from "../components/common/StatusChip";
import usePagedList from "../utils/usePagedList";
import { loanApi } from "../api";
import { formatCurrency, formatDate } from "../utils/format";
import { LOAN_STATUS_META, LOAN_TYPE_LABELS } from "../utils/labels";
import { useAuth } from "../context/AuthContext";
import ApplyLoanDialog from "../components/loans/ApplyLoanDialog";

export default function LoansListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [applyOpen, setApplyOpen] = useState(false);

  const { rows, loading, page, setPage, size, setSize, totalItems, reload } = usePagedList(
    (pg) => loanApi.list({ ...pg, keyword: keyword || undefined, status: status || undefined }),
    [keyword, status]
  );

  const canApply = ["ADMIN", "TELLER", "LOAN_OFFICER"].includes(user?.role);

  const columns = [
    { key: "loan_code", label: "Mã khoản vay" },
    { key: "customer", label: "Khách hàng", render: (r) => r.customer?.full_name },
    { key: "loan_type", label: "Loại vay", render: (r) => LOAN_TYPE_LABELS[r.loan_type] },
    { key: "principal", label: "Số tiền vay", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.principal)}</span> },
    { key: "outstanding_principal", label: "Dư nợ", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.outstanding_principal)}</span> },
    { key: "term_months", label: "Kỳ hạn", render: (r) => `${r.term_months} tháng` },
    { key: "applied_date", label: "Ngày đăng ký", render: (r) => formatDate(r.applied_date) },
    { key: "status", label: "Trạng thái", render: (r) => <StatusChip meta={LOAN_STATUS_META} status={r.status} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Quản lý cho vay"
        subtitle="Danh sách toàn bộ hồ sơ vay trong hệ thống"
        action={
          canApply && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setApplyOpen(true)}>
              Đăng ký khoản vay
            </Button>
          )
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <TextField
          placeholder="Tìm theo mã khoản vay..."
          size="small"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
          sx={{ width: 260 }}
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
          label="Trạng thái"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {Object.entries(LOAN_STATUS_META).map(([k, v]) => (
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
        onRowClick={(row) => navigate(`/loans/${row.id}`)}
        emptyText="Chưa có khoản vay nào."
      />

      <ApplyLoanDialog
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSuccess={(loan) => {
          setApplyOpen(false);
          reload();
          navigate(`/loans/${loan.id}`);
        }}
      />
    </Box>
  );
}
