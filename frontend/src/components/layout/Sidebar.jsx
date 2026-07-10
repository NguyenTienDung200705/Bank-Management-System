import { Box, Drawer, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { NAV_ITEMS } from "./navItems";
import { useAuth } from "../../context/AuthContext";

const DRAWER_WIDTH = 264;

export default function Sidebar({ mobileOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canSee = (roles) => roles === "ALL" || roles.includes(user?.role);

  const content = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "primary.dark", color: "#fff" }}>
      {/* Brand / logo */}
      <Box sx={{ px: 3, py: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "8px",
            bgcolor: "secondary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AccountBalanceIcon sx={{ color: "primary.dark", fontSize: 22 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontFamily: '"Source Serif 4", serif', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
            VietTrust Bank
          </Typography>
          <Typography sx={{ fontSize: 11, opacity: 0.6, letterSpacing: "0.03em" }}>
            SAVINGS &amp; LOAN SYSTEM
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Nav */}
      <List sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 2 }}>
        {NAV_ITEMS.map((item, idx) => {
          if (item.group) {
            return (
              <Typography
                key={`group-${idx}`}
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  opacity: 0.45,
                  textTransform: "uppercase",
                  px: 1.5,
                  mt: idx === 0 ? 0 : 2.5,
                  mb: 1,
                }}
              >
                {item.group}
              </Typography>
            );
          }
          if (!canSee(item.roles)) return null;
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => {
                navigate(item.path);
                onClose?.();
              }}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                color: active ? "primary.dark" : "rgba(255,255,255,0.85)",
                bgcolor: active ? "secondary.main" : "transparent",
                "&:hover": { bgcolor: active ? "secondary.main" : "rgba(255,255,255,0.08)" },
                "&.Mui-selected:hover": { bgcolor: "secondary.main" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
      <Box sx={{ px: 3, py: 2 }}>
        <Typography sx={{ fontSize: 11, opacity: 0.45 }}>© 2026 VietTrust Bank</Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {content}
      </Drawer>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
