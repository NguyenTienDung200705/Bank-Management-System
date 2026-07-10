import { useState, useEffect } from "react";
import { Box, Card, Grid, TextField, Button, Typography, Stack } from "@mui/material";
import dayjs from "dayjs";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import PageHeader from "../components/common/PageHeader";
import DataTable from "../components/common/DataTable";
import StatusChip from "../components/common/StatusChip";
import { reportApi } from "../api";
import { formatCurrency, formatDateTime } from "../utils/format";
import { TRANSACTION_TYPE_META } from "../utils/labels";

const PIE_COLORS = ["#0F1B3C", "#C9A34E", "#2B5F8C", "#1F8A5F", "#B8791C", "#B3261E"];
const GENDER_LABEL = { MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" };

export default function ReportsPage() {
  const [from, setFrom] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [report, setReport] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const runReport = () => {
    setLoading(true);
    reportApi
      .periodic({ from, to })
      .then((res) => setReport(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runReport();
    reportApi.customers().then((res) => setCustomerStats(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalsPie = (report?.totalsByType || []).map((r) => ({
    name: TRANSACTION_TYPE_META[r.type]?.label || r.type,
    value: Number(r.total),
  }));

  const genderData = (customerStats?.byGender || []).map((r) => ({
    name: GENDER_LABEL[r.gender] || r.gender,
    value: Number(r.count),
  }));

  return (
    <Box>
      <PageHeader title="Báo cáo thống kê" subtitle="Báo cáo doanh số giao dịch theo khoảng thời gian tùy chọn" />

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <TextField
            label="Từ ngày"
            type="date"
            size="small"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Đến ngày"
            type="date"
            size="small"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={runReport} disabled={loading}>
            Xem báo cáo
          </Button>
        </Stack>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: 16 }}>
              Tổng hợp theo loại giao dịch
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={totalsPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {totalsPie.map((entry, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {(report?.totalsByType || []).map((r, idx) => (
                <Stack key={r.type} direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <Typography variant="caption" sx={{ flex: 1 }}>
                    {TRANSACTION_TYPE_META[r.type]?.label || r.type} ({r.count})
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {formatCurrency(r.total)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: 16 }}>
              Cơ cấu khách hàng theo giới tính
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={genderData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EEEDE6" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
                <Tooltip />
                <Bar dataKey="value" fill="#0F1B3C" radius={[0, 4, 4, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
            <Typography variant="caption" color="text.secondary">
              {customerStats?.newThisMonth ?? 0} khách hàng mới trong tháng này / tổng {customerStats?.total ?? 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1.5, fontSize: 16 }}>
        Chi tiết giao dịch trong khoảng thời gian
      </Typography>
      <DataTable
        columns={[
          { key: "receipt_no", label: "Số biên lai" },
          { key: "type", label: "Loại", render: (r) => <StatusChip meta={TRANSACTION_TYPE_META} status={r.type} /> },
          { key: "customer", label: "Khách hàng", render: (r) => r.customer?.full_name },
          { key: "amount", label: "Số tiền", align: "right", render: (r) => <span className="mono-amount">{formatCurrency(r.amount)}</span> },
          { key: "transaction_date", label: "Thời gian", render: (r) => formatDateTime(r.transaction_date) },
        ]}
        rows={report?.transactions || []}
        loading={loading}
        emptyText="Không có giao dịch trong khoảng thời gian này."
      />
    </Box>
  );
}
