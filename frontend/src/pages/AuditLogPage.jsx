import { useState } from "react";
import { Box, TextField, InputAdornment, Stack, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import usePagedList from "../utils/usePagedList";
import { auditApi } from "../api";
import { formatDateTime } from "../utils/format";

const LEVEL_COLOR = { INFO: "default", WARN: "warning", ERROR: "error" };

export default function AuditLogPage() {
  const [username, setUsername] = useState("");

  const { rows, loading, page, setPage, size, setSize, totalItems } = usePagedList(
    (pg) => auditApi.list({ ...pg, username: username || undefined }),
    [username]
  );

  const columns = [
    { key: "created_at", label: "Thời gian", render: (r) => formatDateTime(r.createdAt) },
    { key: "username", label: "Người thực hiện" },
    { key: "action", label: "Hành động", render: (r) => <Chip size="small" label={r.action} /> },
    { key: "level", label: "Mức độ", render: (r) => <Chip size="small" label={r.level} color={LEVEL_COLOR[r.level]} /> },
    { key: "description", label: "Mô tả" },
    { key: "ip_address", label: "IP" },
  ];

  return (
    <Box>
      <PageHeader title="Nhật ký hệ thống" subtitle="Toàn bộ hoạt động quan trọng được ghi lại phục vụ kiểm toán" />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Tìm theo tên đăng nhập..."
          size="small"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setPage(1);
          }}
          sx={{ width: 280 }}
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
        emptyText="Chưa có nhật ký nào."
      />
    </Box>
  );
}
