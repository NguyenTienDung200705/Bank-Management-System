import { Card, Box, Typography, Stack, Avatar } from "@mui/material";

export default function StatCard({ icon, label, value, sub, color = "primary.main", accent }) {
  return (
    <Card sx={{ p: 2.5, height: "100%", position: "relative", overflow: "hidden" }}>
      {accent && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            height: "100%",
            bgcolor: accent,
          }}
        />
      )}
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar sx={{ bgcolor: `${color}`, width: 44, height: 44 }} variant="rounded">
          {icon}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {label}
          </Typography>
          <Typography
            variant="h5"
            className="mono-amount"
            sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, mt: 0.3 }}
            noWrap
          >
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary">
              {sub}
            </Typography>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
