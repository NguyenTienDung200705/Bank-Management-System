import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, InputAdornment, MenuItem, Stack } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import StatusChip from "../components/common/StatusChip";
import usePagedList from "../utils/usePagedList";
import { savingApi } from "../api";
import { formatCurrency, formatDate } from "../utils/format";
import { SAVING_STATUS_META, SAVING_TYPE_LABELS } from "../utils/labels";
import { useAuth } from "../context/AuthContext";
import OpenSavingDialog from "../components/savings/OpenSavingDialog";

export default function SavingsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const { rows, loading, page, setPage, size, setSize, totalItems, reload } = usePagedList(
    (pg) => savingApi.list({ ...pg, keyword: keyword || undefined, status: status || undefined }),
    [keyword, status]
  );

  const canOperate = ["ADMIN", "TELLER"].includes(user?.role);

  const columns = [
    { key: "saving_code", label: "Mã sổ" },
    { key: "customer", label: "Khách hàng", render: (r) => r.customer?.full_name },
    { key: "saving_type", label: "Loại", render: (r) => SAVING_TYPE_LABELS[r.saving_type] },
    {
      key: "balance",
      label: "Số dư",
      align: "right",
      render: (r) => <span className="mono-amount">{formatCurrency(r.balance)}</span>,
    },
    { key: "interest_rate", label: "Lãi suất", align: "right", render: (r) => `${r.interest_rate}%/năm` },
    { key: "open_date", label: "Ngày mở", render: (r) => formatDate(r.open_date) },
    { key: "maturity_date", label: "Ngày đáo hạn", render: (r) => formatDate(r.maturity_date) },
    { key: "status", label: "Trạng thái", render: (r) => <StatusChip meta={SAVING_STATUS_META} status={r.status} /> },
  ];

  return (
    <Box>
      <PageHeader
        title="Quản lý tiết kiệm"
        subtitle="Danh sách toàn bộ sổ tiết kiệm trong hệ thống"
        action={
          canOperate && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
              Mở sổ tiết kiệm
            </Button>
          )
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <TextField
          placeholder="Tìm theo mã sổ..."
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
          <MenuItem value="ACTIVE">Đang hoạt động</MenuItem>
          <MenuItem value="CLOSED">Đã tất toán</MenuItem>
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
        onRowClick={(row) => navigate(`/savings/${row.id}`)}
        emptyText="Chưa có sổ tiết kiệm nào."
      />

      <OpenSavingDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={(account) => {
          setOpenDialog(false);
          reload();
          navigate(`/savings/${account.id}`);
        }}
      />
    </Box>
  );
}
