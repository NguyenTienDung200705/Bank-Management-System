import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

export const NAV_ITEMS = [
  { group: "Tổng quan" },
  { path: "/", label: "Bảng điều khiển", icon: DashboardOutlinedIcon, roles: "ALL" },

  { group: "Nghiệp vụ" },
  { path: "/customers", label: "Khách hàng", icon: PeopleAltOutlinedIcon, roles: "ALL" },
  { path: "/savings", label: "Tiết kiệm", icon: SavingsOutlinedIcon, roles: "ALL" },
  { path: "/loans", label: "Cho vay", icon: AccountBalanceOutlinedIcon, roles: "ALL" },
  { path: "/transactions", label: "Giao dịch", icon: ReceiptLongOutlinedIcon, roles: "ALL" },

  { group: "Phân tích" },
  { path: "/reports", label: "Báo cáo thống kê", icon: BarChartOutlinedIcon, roles: "ALL" },
  { path: "/interest-rates", label: "Lãi suất", icon: PercentOutlinedIcon, roles: "ALL" },

  { group: "Quản trị hệ thống" },
  { path: "/users", label: "Người dùng", icon: ManageAccountsOutlinedIcon, roles: ["ADMIN"] },
  { path: "/audit-logs", label: "Nhật ký hệ thống", icon: HistoryOutlinedIcon, roles: ["ADMIN"] },
  { path: "/system-config", label: "Cấu hình hệ thống", icon: TuneOutlinedIcon, roles: ["ADMIN"] },
];
