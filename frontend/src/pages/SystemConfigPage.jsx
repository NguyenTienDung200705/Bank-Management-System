import { useState, useEffect, useCallback } from "react";
import { Box, Card, Grid, Typography, TextField, Button, Stack, Switch, Alert } from "@mui/material";
import PageHeader from "../components/common/PageHeader";
import { configApi } from "../api";

export default function SystemConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [dirty, setDirty] = useState({});
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    configApi.list().then((res) => setConfigs(res.data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (cfg) => {
    setSaving((s) => ({ ...s, [cfg.config_key]: true }));
    try {
      await configApi.update(cfg.config_key, dirty[cfg.config_key]);
      setMessage(`Đã cập nhật "${cfg.label}".`);
      setDirty((d) => {
        const next = { ...d };
        delete next[cfg.config_key];
        return next;
      });
      load();
    } finally {
      setSaving((s) => ({ ...s, [cfg.config_key]: false }));
    }
  };

  return (
    <Box>
      <PageHeader title="Cấu hình hệ thống" subtitle="Các tham số vận hành toàn hệ thống" />

      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {configs.map((cfg) => {
          const currentValue = dirty[cfg.config_key] !== undefined ? dirty[cfg.config_key] : cfg.config_value;
          const isDirty = dirty[cfg.config_key] !== undefined && dirty[cfg.config_key] !== cfg.config_value;
          return (
            <Grid size={{ xs: 12, sm: 6 }} key={cfg.config_key}>
              <Card sx={{ p: 2.5 }}>
                <Typography variant="body2" fontWeight={700}>
                  {cfg.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                  {cfg.config_key}
                </Typography>

                {cfg.data_type === "BOOLEAN" ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Switch
                      checked={currentValue === "true"}
                      onChange={(e) =>
                        setDirty((d) => ({ ...d, [cfg.config_key]: e.target.checked ? "true" : "false" }))
                      }
                    />
                    <Typography variant="body2">{currentValue === "true" ? "Bật" : "Tắt"}</Typography>
                  </Stack>
                ) : (
                  <TextField
                    size="small"
                    fullWidth
                    type={cfg.data_type === "NUMBER" ? "number" : "text"}
                    value={currentValue}
                    onChange={(e) => setDirty((d) => ({ ...d, [cfg.config_key]: e.target.value }))}
                  />
                )}

                {isDirty && (
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ mt: 1.5 }}
                    onClick={() => handleSave(cfg)}
                    disabled={saving[cfg.config_key]}
                  >
                    Lưu thay đổi
                  </Button>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
