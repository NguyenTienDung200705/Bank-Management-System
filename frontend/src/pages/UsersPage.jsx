import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  Menu,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import StatusChip from "../components/common/StatusChip";
import ConfirmDialog from "../components/common/ConfirmDialog";
import usePagedList from "../utils/usePagedList";
import { userApi } from "../api";
import { formatDateTime } from "../utils/format";
import { ROLE_LABELS, USER_STATUS_META } from "../utils/labels";
import { useAuth } from "../context/AuthContext";
import UserFormDialog from "../components/users/UserFormDialog";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuUser, setMenuUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // {type, user}
  const [tempPasswordInfo, setTempPasswordInfo] = useState(null);
  const [actionError, setActionError] = useState("");

  const { rows, loading, page, setPage, size, setSize, totalItems, reload } = usePagedList(
    (pg) => userApi.list({ ...pg, keyword: keyword || undefined, role: role || undefined }),
    [keyword, role]
  );

  const openMenu = (e, row) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuUser(row);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuUser(null);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActionError("");
    try {
      if (confirmAction.type === "lock") await userApi.lock(confirmAction.user.id);
      if (confirmAction.type === "unlock") await userApi.unlock(confirmAction.user.id);
      if (confirmAction.type === "delete") await userApi.remove(confirmAction.user.id);
      if (confirmAction.type === "reset") {
        const res = await userApi.resetPassword(confirmAction.user.id);
        setTempPasswordInfo(res.data);
      }
      setConfirmAction(null);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const columns = [
    { key: "full_name", label: "Họ tên" },
    { key: "username", label: "Tên đăng nhập" },
    { key: "email", label: "Email" },
    { key: "role", label: "Vai trò", render: (r) => <Chip size="small" label={ROLE_LABELS[r.role]} /> },
    { key: "status", label: "Trạng thái", render: (r) => <StatusChip meta={USER_STATUS_META} status={r.status} /> },
    { key: "last_login_at", label: "Đăng nhập gần nhất", render: (r) => formatDateTime(r.last_login_at) },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (r) => (
        <IconButton size="small" onClick={(e) => openMenu(e, r)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Quản lý tài khoản nhân viên và phân quyền hệ thống"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Thêm người dùng
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <TextField
          placeholder="Tìm theo tên, tài khoản, email..."
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
          label="Vai trò"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <MenuItem key={k} value={k}>
              {v}
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
        emptyText="Chưa có người dùng nào."
      />

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            setEditUser(menuUser);
            setFormOpen(true);
            closeMenu();
          }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Chỉnh sửa
        </MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmAction({ type: "reset", user: menuUser });
            closeMenu();
          }}
        >
          <KeyOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Đặt lại mật khẩu
        </MenuItem>
        {menuUser?.status === "ACTIVE" ? (
          <MenuItem
            onClick={() => {
              setConfirmAction({ type: "lock", user: menuUser });
              closeMenu();
            }}
          >
            <LockOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Khóa tài khoản
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              setConfirmAction({ type: "unlock", user: menuUser });
              closeMenu();
            }}
          >
            <LockOpenOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Mở khóa tài khoản
          </MenuItem>
        )}
        {menuUser?.id !== currentUser?.id && (
          <MenuItem
            sx={{ color: "error.main" }}
            onClick={() => {
              setConfirmAction({ type: "delete", user: menuUser });
              closeMenu();
            }}
          >
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Xóa người dùng
          </MenuItem>
        )}
      </Menu>

      <UserFormDialog
        open={formOpen}
        user={editUser}
        onClose={() => {
          setFormOpen(false);
          setEditUser(null);
        }}
        onSuccess={() => {
          setFormOpen(false);
          setEditUser(null);
          reload();
        }}
      />

      <ConfirmDialog
        open={!!confirmAction}
        title={
          {
            lock: "Khóa tài khoản",
            unlock: "Mở khóa tài khoản",
            delete: "Xóa người dùng",
            reset: "Đặt lại mật khẩu",
          }[confirmAction?.type]
        }
        content={
          actionError ||
          `Bạn có chắc chắn muốn thực hiện thao tác này với tài khoản "${confirmAction?.user?.username}"?`
        }
        confirmColor={confirmAction?.type === "delete" ? "error" : "primary"}
        onClose={() => {
          setConfirmAction(null);
          setActionError("");
        }}
        onConfirm={handleConfirm}
      />

      <Dialog open={!!tempPasswordInfo} onClose={() => setTempPasswordInfo(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>Mật khẩu tạm thời</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 1 }}>
            Đã đặt lại mật khẩu cho tài khoản <b>{tempPasswordInfo?.username}</b>
          </Alert>
          <Typography variant="body2">
            Mật khẩu tạm thời: <b style={{ fontFamily: "IBM Plex Mono, monospace" }}>{tempPasswordInfo?.tempPassword}</b>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vui lòng cung cấp mật khẩu này cho người dùng và yêu cầu đổi mật khẩu ngay lần đăng nhập tới.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={() => setTempPasswordInfo(null)}>
            Đã hiểu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
