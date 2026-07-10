import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Grid,
  Typography,
  Avatar,
  Stack,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import StatusChip from "../components/common/StatusChip";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { customerApi } from "../api";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";
import { SAVING_STATUS_META, LOAN_STATUS_META, SAVING_TYPE_LABELS, LOAN_TYPE_LABELS, TRANSACTION_TYPE_META } from "../utils/labels";
import usePagedList from "../utils/usePagedList";
import { useAuth } from "../context/AuthContext";
import CustomerFormDialog from "../components/customers/CustomerFormDialog";

const GENDER_LABEL = { MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" };

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(() => {
    customerApi.getById(id).then((res) => setCustomer(res.data));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const { rows: txRows, loading: txLoading, page, setPage, size, setSize, totalItems } = usePagedList(
    (pg) => customerApi.getTransactions(id, pg),
    [id, tab],
    10
  );

  if (!customer) return null;

  const canEdit = ["ADMIN", "TELLER"].includes(user?.role);
  const canDelete = user?.role === "ADMIN";

  const handleDelete = async () => {
    setDeleteError("");
    try {
      await customerApi.remove(id);
      navigate("/customers");
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <IconButton onClick={() => navigate("/customers")} size="small">
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Quay lại danh sách khách hàng
        </Typography>
      </Stack>

      <Card sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: "auto" }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.dark", fontSize: 26 }}>
              {customer.full_name?.charAt(0)}
            </Avatar>
          </Grid>
          <Grid size="grow">
            <Typography variant="h5" sx={{ color: "primary.dark" }}>
              {customer.full_name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip size="small" label={customer.customer_code} variant="outlined" />
              <Typography variant="body2" color="text.secondary">
                {customer.citizen_id}
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: "auto" }}>
            <Stack direction="row" spacing={1}>
              {canEdit && (
                <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setEditOpen(true)}>
                  Chỉnh sửa
                </Button>
              )}
              {canDelete && (
                <Button color="error" variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteOpen(true)}>
                  Xóa
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        <Grid container spacing={3}>
          <InfoItem label="Ngày sinh" value={formatDate(customer.date_of_birth)} />
          <InfoItem label="Giới tính" value={GENDER_LABEL[customer.gender] || customer.gender} />
          <InfoItem label="Điện thoại" value={customer.phone} />
          <InfoItem label="Email" value={customer.email || "—"} />
          <InfoItem label="Nghề nghiệp" value={customer.occupation || "—"} />
          <InfoItem label="Địa chỉ" value={customer.address || "—"} />
        </Grid>
      </Card>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Sổ tiết kiệm (${customer.savingAccounts?.length || 0})`} />
        <Tab label={`Khoản vay (${customer.loans?.length || 0})`} />
        <Tab label="Lịch sử giao dịch" />
      </Tabs>

      {tab === 0 && (
        <DataTable
          columns={[
            { key: "saving_code", label: "Mã sổ" },
            { key: "saving_type", label: "Loại", render: (r) => SAVING_TYPE_LABELS[r.saving_type] },
            { key: "balance", label: "Số dư", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.balance)}</span> },
            { key: "interest_rate", label: "Lãi suất", align: "right", render: (r) => `${r.interest_rate}%/năm` },
            { key: "open_date", label: "Ngày mở", render: (r) => formatDate(r.open_date) },
            { key: "status", label: "Trạng thái", render: (r) => <StatusChip meta={SAVING_STATUS_META} status={r.status} /> },
          ]}
          rows={customer.savingAccounts || []}
          loading={false}
          onRowClick={(row) => navigate(`/savings/${row.id}`)}
          emptyText="Khách hàng chưa có sổ tiết kiệm nào."
        />
      )}

      {tab === 1 && (
        <DataTable
          columns={[
            { key: "loan_code", label: "Mã khoản vay" },
            { key: "loan_type", label: "Loại vay", render: (r) => LOAN_TYPE_LABELS[r.loan_type] },
            { key: "principal", label: "Số tiền vay", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.principal)}</span> },
            { key: "outstanding_principal", label: "Dư nợ", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.outstanding_principal)}</span> },
            { key: "applied_date", label: "Ngày đăng ký", render: (r) => formatDate(r.applied_date) },
            { key: "status", label: "Trạng thái", render: (r) => <StatusChip meta={LOAN_STATUS_META} status={r.status} /> },
          ]}
          rows={customer.loans || []}
          loading={false}
          onRowClick={(row) => navigate(`/loans/${row.id}`)}
          emptyText="Khách hàng chưa có khoản vay nào."
        />
      )}

      {tab === 2 && (
        <DataTable
          columns={[
            { key: "receipt_no", label: "Số biên lai" },
            { key: "type", label: "Loại GD", render: (r) => <StatusChip meta={TRANSACTION_TYPE_META} status={r.type} /> },
            { key: "reference_code", label: "Tham chiếu" },
            { key: "amount", label: "Số tiền", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.amount)}</span> },
            { key: "transaction_date", label: "Thời gian", render: (r) => formatDateTime(r.transaction_date) },
          ]}
          rows={txRows}
          loading={txLoading}
          page={page}
          size={size}
          totalItems={totalItems}
          onPageChange={setPage}
          onSizeChange={setSize}
          emptyText="Chưa có giao dịch nào."
        />
      )}

      <CustomerFormDialog
        open={editOpen}
        customer={customer}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          load();
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Xóa khách hàng"
        content={deleteError || `Bạn có chắc chắn muốn xóa khách hàng "${customer.full_name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmColor="error"
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}

function InfoItem({ label, value }) {
  return (
    <Grid size={{ xs: 12, sm: 4 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Grid>
  );
}
