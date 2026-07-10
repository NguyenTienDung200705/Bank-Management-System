import { createTheme } from "@mui/material/styles";

// Bảng màu: Navy (tin cậy, ngân hàng truyền thống) + Gold (giá trị, lãi suất)
export const palette = {
  navy: {
    900: "#0A1230",
    800: "#0F1B3C",
    700: "#152650",
    600: "#1E3564",
    100: "#E7EAF3",
  },
  gold: {
    main: "#C9A34E",
    light: "#E4C783",
    dark: "#9C7A2F",
    contrastText: "#0A1230",
  },
  ink: "#161B2C",
  paper: "#FFFFFF",
  canvas: "#F5F5F1",
  success: "#1F8A5F",
  danger: "#B3261E",
  warning: "#B8791C",
  info: "#2B5F8C",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: palette.navy[800], light: palette.navy[600], dark: palette.navy[900], contrastText: "#fff" },
    secondary: { main: palette.gold.main, light: palette.gold.light, dark: palette.gold.dark, contrastText: palette.gold.contrastText },
    success: { main: palette.success },
    error: { main: palette.danger },
    warning: { main: palette.warning },
    info: { main: palette.info },
    background: { default: palette.canvas, paper: palette.paper },
    text: { primary: palette.ink, secondary: "#5B5F72" },
    divider: "#E4E3DC",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Source Serif 4", serif', fontWeight: 600 },
    h2: { fontFamily: '"Source Serif 4", serif', fontWeight: 600 },
    h3: { fontFamily: '"Source Serif 4", serif', fontWeight: 600 },
    h4: { fontFamily: '"Source Serif 4", serif', fontWeight: 600, letterSpacing: "-0.01em" },
    h5: { fontFamily: '"Source Serif 4", serif', fontWeight: 600 },
    h6: { fontFamily: '"Source Serif 4", serif', fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 16 },
        containedPrimary: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none", backgroundColor: palette.navy[700] },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${"#E4E3DC"}`,
          boxShadow: "0 1px 2px rgba(15,27,60,0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: palette.navy[700],
          backgroundColor: "#F8F7F2",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { border: "none" },
      },
    },
  },
});

export default theme;
