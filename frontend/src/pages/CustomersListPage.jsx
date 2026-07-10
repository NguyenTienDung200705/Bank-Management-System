import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, InputAdornment, Avatar, Stack, Typography, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import usePagedList from "../utils/usePagedList";
import { customerApi } from "../api";
import { formatDate } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import CustomerFormDialog from "../components/customers/CustomerFormDialog";

const GENDER_LABEL = { MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" };

export default function CustomersListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const { rows, loading, page, setPage, size, setSize, totalItems, reload } = usePagedList(
    (pg) => customerApi.list({ ...pg, keyword: keyword || undefined }),
    [keyword]
  );

  const canCreate = ["ADMIN", "TELLER"].includes(user?.role);

  const columns = [
    {
      key: "full_name",
      label: "Khách hàng",
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.dark", fontSize: 14 }}>
            {row.full_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {row.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.customer_code}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    { key: "citizen_id", label: "CCCD/CMND" },
    { key: "phone", label: "Điện thoại" },
    { key: "gender", label: "Giới tính", render: (row) => GENDER_LABEL[row.gender] || row.gender },
    { key: "occupation", label: "Nghề nghiệp" },
    { key: "created_at", label: "Ngày tạo", render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <Box>
      <PageHeader
        title="Quản lý khách hàng"
        subtitle="Danh sách toàn bộ khách hàng đang giao dịch tại ngân hàng"
        action={
          canCreate && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
              Thêm khách hàng
            </Button>
          )
        }
      />

      <TextField
        placeholder="Tìm theo tên, mã KH, CCCD hoặc số điện thoại..."
        size="small"
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          setPage(1);
        }}
        sx={{ mb: 2, width: { xs: "100%", sm: 380 } }}
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

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        page={page}
        size={size}
        totalItems={totalItems}
        onPageChange={setPage}
        onSizeChange={setSize}
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
        emptyText="Chưa có khách hàng nào."
      />

      <CustomerFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          reload();
        }}
      />
    </Box>
  );
}
