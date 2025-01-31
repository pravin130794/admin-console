import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "ArialBlack",
  },
  palette: {
    primary: {
      main: "#1976d2", // Customize the primary color
    },
    secondary: {
      main: "#dc004e", // Customize the secondary color
    },
  },
});

export default theme;
