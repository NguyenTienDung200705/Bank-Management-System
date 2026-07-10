import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/vi";
import App from "./App.jsx";
import theme from "./theme/theme.js";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>
);
