import { useEffect, useState } from "react";
import { Box, Grid, Card, Typography, Stack, Chip, LinearProgress } from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import { reportApi } from "../api";
import { formatCurrency } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { LOAN_STATUS_META, SAVING_TYPE_LABELS, LOAN_TYPE_LABELS } from "../utils/labels";

const PIE_COLORS = ["#0F1B3C", "#C9A34E", "#2B5F8C", "#1F8A5F", "#B8791C", "#B3261E"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [savingStats, setSavingStats] = useState(null);
  const [loanStats, setLoanStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportApi.summary(),
      reportApi.savings(),
      reportApi.loans(),
      reportApi.revenue({ months: 6 }),
    ])
      .then(([s, sv, ln, rv]) => {
        setSummary(s.data);
        setSavingStats(sv.data);
        setLoanStats(ln.data);
        setRevenue(rv.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const savingPieData = (savingStats?.byType || []).map((r) => ({
    name: SAVING_TYPE_LABELS[r.saving_type] || r.saving_type,
    value: Number(r.totalBalance) || 0,
  }));

  const loanPieData = (loanStats?.byType || []).map((r) => ({
    name: LOAN_TYPE_LABELS[r.loan_type] || r.loan_type,
    value: Number(r.totalOutstanding) || 0,
  }));

  const revenueChartData = groupRevenueByMonth(revenue);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <Box>
      <PageHeader
        title={`${greeting}, ${user?.full_name?.split(" ").pop() || ""}`}
        subtitle="Tổng quan hoạt động hệ thống tiết kiệm &amp; cho vay hôm nay"
      />

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<PeopleAltOutlinedIcon />}
            label="Tổng số khách hàng"
            value={summary?.totalCustomers ?? "—"}
            color="primary.main"
            accent="primary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<SavingsOutlinedIcon />}
            label="Số dư tiết kiệm đang hoạt động"
            value={formatCurrency(summary?.totalSavingsBalance)}
            sub={`${summary?.activeSavings ?? 0} sổ đang hoạt động`}
            color="secondary.main"
            accent="secondary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<AccountBalanceOutlinedIcon />}
            label="Dư nợ cho vay"
            value={formatCurrency(summary?.totalOutstanding)}
            sub={`${summary?.activeLoans ?? 0} khoản vay đang hoạt động`}
            color="info.main"
            accent="info.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<WarningAmberOutlinedIcon />}
            label="Khoản vay quá hạn"
            value={summary?.overdueLoans ?? 0}
            color="error.main"
            accent="error.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            icon={<ReceiptLongOutlinedIcon />}
            label="Giao dịch hôm nay"
            value={summary?.todayTransactions ?? 0}
            color="primary.light"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            icon={<PaidOutlinedIcon />}
            label="Tổng lãi thu từ cho vay"
            value={formatCurrency(summary?.totalInterestCollected)}
            color="secondary.dark"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: 17 }}>
              Doanh số giao dịch theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEEDE6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="DEPOSIT" name="Tiền gửi" fill="#0F1B3C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="WITHDRAW" name="Rút tiền" fill="#C9A34E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="LOAN_REPAYMENT" name="Thu nợ vay" fill="#1F8A5F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="LOAN_DISBURSEMENT" name="Giải ngân" fill="#2B5F8C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: 17 }}>
              Cơ cấu dư nợ cho vay theo loại
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={loanPieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {loanPieData.map((entry, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              {loanPieData.map((d, idx) => (
                <Stack key={d.name} direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <Typography variant="caption" sx={{ flex: 1 }}>
                    {d.name}
                  </Typography>
                  <Typography variant="caption" fontWeight={700}>
                    {formatCurrency(d.value)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: 17 }}>
              Cơ cấu số dư tiết kiệm theo kỳ hạn
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={savingPieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {savingPieData.map((entry, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: 17 }}>
              Trạng thái khoản vay
            </Typography>
            <Stack spacing={1.5}>
              {(loanStats?.byStatus || []).map((row) => {
                const meta = LOAN_STATUS_META[row.status] || {};
                const total = (loanStats?.byStatus || []).reduce((s, r) => s + Number(r.count), 0) || 1;
                const pct = (Number(row.count) / total) * 100;
                return (
                  <Box key={row.status}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Chip size="small" label={meta.label || row.status} color={meta.color} />
                      <Typography variant="body2" fontWeight={700}>
                        {row.count}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      color={meta.color === "default" ? "inherit" : meta.color}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function groupRevenueByMonth(rows) {
  const map = {};
  for (const r of rows) {
    if (!map[r.month]) map[r.month] = { month: r.month };
    map[r.month][r.type] = Number(r.total);
  }
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}
