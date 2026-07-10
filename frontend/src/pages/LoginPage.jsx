import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Left brand panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          bgcolor: "primary.dark",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
        }}
      >
        {/* Decorative ledger lines pattern */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent, transparent 38px, #fff 39px, transparent 40px)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: "50%",
            border: "1px solid rgba(201,163,78,0.3)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -160,
            right: -60,
            width: 420,
            height: 420,
            borderRadius: "50%",
            border: "1px solid rgba(201,163,78,0.15)",
          }}
        />

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: "relative" }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              bgcolor: "secondary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AccountBalanceIcon sx={{ color: "primary.dark" }} />
          </Box>
          <Typography sx={{ fontFamily: '"Source Serif 4", serif', fontWeight: 700, fontSize: 22 }}>
            VietTrust Bank
          </Typography>
        </Stack>

        <Box sx={{ position: "relative", maxWidth: 440 }}>
          <Typography sx={{ fontFamily: '"Source Serif 4", serif', fontSize: 34, fontWeight: 600, lineHeight: 1.25 }}>
            Hệ thống Quản lý Tiết kiệm &amp; Cho vay
          </Typography>
          <Typography sx={{ mt: 2, opacity: 0.7, fontSize: 15, lineHeight: 1.7 }}>
            Nền tảng nội bộ hỗ trợ giao dịch viên, chuyên viên tín dụng và quản lý điều hành
            toàn bộ nghiệp vụ tiền gửi tiết kiệm và cho vay một cách chính xác, minh bạch.
          </Typography>
        </Box>

        <Typography sx={{ position: "relative", fontSize: 12, opacity: 0.45 }}>
          © 2026 VietTrust Bank — Bảo mật &amp; Tin cậy
        </Typography>
      </Box>

      {/* Right login form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{ width: "100%", maxWidth: 400, p: { xs: 3, sm: 4 }, border: "1px solid", borderColor: "divider" }}
        >
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                bgcolor: "secondary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccountBalanceIcon sx={{ color: "primary.dark", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontFamily: '"Source Serif 4", serif', fontWeight: 700, fontSize: 18 }}>
              VietTrust Bank
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ mb: 0.5, color: "primary.dark" }}>
            Đăng nhập hệ thống
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Vui lòng nhập thông tin tài khoản nội bộ của bạn.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                required
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box sx={{ textAlign: "right" }}>
                <Link component="button" type="button" variant="body2" onClick={() => setForgotOpen(true)}>
                  Quên mật khẩu?
                </Link>
              </Box>

              <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </Stack>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: "1px dashed", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Tài khoản demo (bấm để điền nhanh):
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {[
                { label: "Admin", u: "admin", p: "Admin@123" },
                { label: "Giao dịch viên", u: "teller1", p: "Teller@123" },
                { label: "Tín dụng", u: "loanofficer1", p: "Loan@123" },
                { label: "Quản lý", u: "manager1", p: "Manager@123" },
              ].map((acc) => (
                <Button
                  key={acc.u}
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => quickFill(acc.u, acc.p)}
                  sx={{ fontSize: 12 }}
                >
                  {acc.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Box>

      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </Box>
  );
}

function ForgotPasswordDialog({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep(1);
    setEmail("");
    setCode("");
    setDevCode("");
    setNewPassword("");
    setMsg("");
    setErr("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const requestCode = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await authApi.forgotPassword({ email });
      setMsg(res.message);
      if (res.data?.devResetCode) setDevCode(res.data.devResetCode);
      setStep(2);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async () => {
    setLoading(true);
    setErr("");
    try {
      await authApi.resetPassword({ email, verificationCode: code, newPassword });
      setMsg("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
      setStep(3);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Source Serif 4", serif' }}>Khôi phục mật khẩu</DialogTitle>
      <DialogContent>
        {err && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {err}
          </Alert>
        )}
        {step === 1 && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Nhập email đã đăng ký với tài khoản của bạn để nhận mã xác nhận.
            </Typography>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          </Stack>
        )}
        {step === 2 && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {msg && <Alert severity="info">{msg}</Alert>}
            {devCode && (
              <Alert severity="warning">
                Môi trường demo — mã xác nhận của bạn: <b>{devCode}</b>
              </Alert>
            )}
            <TextField label="Mã xác nhận (6 số)" value={code} onChange={(e) => setCode(e.target.value)} fullWidth />
            <TextField
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              helperText="Tối thiểu 8 ký tự"
            />
          </Stack>
        )}
        {step === 3 && <Alert severity="success">{msg}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          {step === 3 ? "Đóng" : "Hủy"}
        </Button>
        {step === 1 && (
          <Button variant="contained" onClick={requestCode} disabled={!email || loading}>
            Gửi mã xác nhận
          </Button>
        )}
        {step === 2 && (
          <Button variant="contained" onClick={submitReset} disabled={!code || !newPassword || loading}>
            Đặt lại mật khẩu
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
