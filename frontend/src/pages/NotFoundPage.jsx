import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 2 }}>
      <Typography sx={{ fontFamily: '"Source Serif 4", serif', fontSize: 80, fontWeight: 700, color: "primary.dark" }}>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Không tìm thấy trang bạn yêu cầu.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        Về trang chủ
      </Button>
    </Box>
  );
}
