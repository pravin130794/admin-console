import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App";
import theme from "./theme";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <RecoilRoot>
    <React.StrictMode>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </React.StrictMode>
  </RecoilRoot>
);
