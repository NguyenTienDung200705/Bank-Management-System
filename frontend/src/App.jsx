import { Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CustomersListPage from "./pages/CustomersListPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import SavingsListPage from "./pages/SavingsListPage";
import SavingDetailPage from "./pages/SavingDetailPage";
import LoansListPage from "./pages/LoansListPage";
import LoanDetailPage from "./pages/LoanDetailPage";
import TransactionsPage from "./pages/TransactionsPage";
import InterestRatesPage from "./pages/InterestRatesPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import AuditLogPage from "./pages/AuditLogPage";
import SystemConfigPage from "./pages/SystemConfigPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersListPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/savings" element={<SavingsListPage />} />
            <Route path="/savings/:id" element={<SavingDetailPage />} />
            <Route path="/loans" element={<LoansListPage />} />
            <Route path="/loans/:id" element={<LoanDetailPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/interest-rates" element={<InterestRatesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />

            <Route
              path="/users"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AuditLogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-config"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <SystemConfigPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </SnackbarProvider>
  );
}
