import { Chip } from "@mui/material";

export default function StatusChip({ meta, status }) {
  const info = meta?.[status] || { label: status, color: "default" };
  return <Chip size="small" label={info.label} color={info.color} variant={info.color === "default" ? "outlined" : "filled"} />;
}
