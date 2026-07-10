import { useState } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";
import Topbar from "./Topbar";
import { NAV_ITEMS } from "./navItems";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const currentNav = NAV_ITEMS.find((i) => i.path === location.pathname);
  const title = currentNav?.label || "";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar onMenuClick={() => setMobileOpen(true)} title={title} />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
