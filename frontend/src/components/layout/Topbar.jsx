import { useState, useEffect, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  Popover,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationApi } from "../../api";
import { ROLE_LABELS } from "../../utils/labels";
import { formatDateTime } from "../../utils/format";

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);

  const loadUnread = useCallback(() => {
    notificationApi.unreadCount().then((res) => setUnread(res.data.count)).catch(() => {});
  }, []);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, [loadUnread]);

  const openNotifs = (e) => {
    setNotifAnchor(e.currentTarget);
    notificationApi.list({ page: 1, size: 8 }).then((res) => setNotifs(res.data.items || []));
  };

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    setUnread(0);
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton onClick={onMenuClick} sx={{ display: { xs: "inline-flex", md: "none" } }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ fontSize: 18, flex: 1, color: "primary.dark" }}>
          {title}
        </Typography>

        <IconButton onClick={openNotifs}>
          <Badge badgeContent={unread} color="error">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>

        <Popover
          open={!!notifAnchor}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ width: 360, maxHeight: 440, display: "flex", flexDirection: "column" }}>
            <Box sx={{ px: 2, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography fontWeight={700}>Thông báo</Typography>
              <Button size="small" onClick={markAllRead}>
                Đánh dấu đã đọc
              </Button>
            </Box>
            <Divider />
            <List sx={{ overflowY: "auto", flex: 1 }}>
              {notifs.length === 0 && (
                <ListItem>
                  <ListItemText primary="Không có thông báo nào." />
                </ListItem>
              )}
              {notifs.map((n) => (
                <ListItem key={n.id} sx={{ bgcolor: n.is_read ? "transparent" : "rgba(201,163,78,0.08)" }} divider>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {n.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {n.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatDateTime(n.created_at || n.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Popover>

        <Box
          onClick={(e) => setUserMenuAnchor(e.currentTarget)}
          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", pl: 1 }}
        >
          <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", color: "primary.dark", fontWeight: 700 }}>
            {user?.full_name?.charAt(0) || "U"}
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
              {user?.full_name}
            </Typography>
            <Chip label={ROLE_LABELS[user?.role] || user?.role} size="small" sx={{ height: 18, fontSize: 10 }} />
          </Box>
        </Box>

        <Menu anchorEl={userMenuAnchor} open={!!userMenuAnchor} onClose={() => setUserMenuAnchor(null)}>
          <MenuItem
            onClick={() => {
              navigate("/profile");
              setUserMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <PersonOutlineOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Hồ sơ cá nhân
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate("/change-password");
              setUserMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <LockOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Đổi mật khẩu
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <LogoutOutlinedIcon fontSize="small" color="error" />
            </ListItemIcon>
            Đăng xuất
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
