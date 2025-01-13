import { React, useState } from "react";
import {
  AppBar,
  Toolbar,
  Alert,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SapphireLogo from "../assets/SapphireLogo.png";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Auth";
import SnackbarComponent from "../components/Snackbar";

const AppBarLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const username = localStorage.getItem("username");
  const location = useLocation(); // Get the current location
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const handleLogout = async () => {
    try {
      // Call the logout API

      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:8001/api/v1/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.detail,
          severity: "error",
        });
        // throw new Error(errorData.detail || "Logout failed");
      }
      // Clear authentication tokens
      localStorage.removeItem("authToken");
      setSnackbar({
        open: true,
        message: "Logout successful!",
        severity: "success",
      });
      // Navigate to the login page
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Logout failed",
        severity: "error",
      });
    }
  };

  // Function to check if a link is active
  const isActive = (path) => location.pathname === path;

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "#5a8dff" }}>
        <Toolbar>
          {/* Logo and Navigation Links */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            {/* Logo */}
            <Box
              display="flex"
              alignItems="center"
              sx={{ marginRight: "16px" }}
            >
              <img
                src={SapphireLogo}
                alt="Sapphire Logo"
                style={{ height: "60px", marginRight: "8px" }}
              />
            </Box>

            {/* Navigation Links */}
            <Box display="flex">
              <Button
                component={Link}
                to="/devices"
                sx={{
                  backgroundColor: isActive("/devices")
                    ? "#0026d1"
                    : "transparent", // Highlight active button
                  color: "white",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: isActive("/devices")
                      ? "#000080"
                      : "#0026d1",
                  },
                }}
              >
                Devices
              </Button>
              <Button
                component={Link}
                to="/users"
                sx={{
                  backgroundColor: isActive("/users")
                    ? "#0026d1"
                    : "transparent",
                  color: "white",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: isActive("/users") ? "#000080" : "#0026d1",
                  },
                }}
              >
                Users
              </Button>
              <Button
                component={Link}
                to="/groups"
                sx={{
                  backgroundColor: isActive("/groups")
                    ? "#0026d1"
                    : "transparent",
                  color: "white",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: isActive("/groups")
                      ? "#000080"
                      : "#0026d1",
                  },
                }}
              >
                Groups
              </Button>
              <Button
                component={Link}
                to="/projects"
                sx={{
                  backgroundColor: isActive("/projects")
                    ? "#0026d1"
                    : "transparent",
                  color: "white",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: isActive("/projects")
                      ? "#000080"
                      : "#0026d1",
                  },
                }}
              >
                Projects
              </Button>
              <Button
                component={Link}
                to="/hosts"
                sx={{
                  backgroundColor: isActive("/hosts")
                    ? "#0026d1"
                    : "transparent",
                  color: "white",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: isActive("/hosts") ? "#000080" : "#0026d1",
                  },
                }}
              >
                Hosts
              </Button>
            </Box>
          </Box>

          {/* User Logout */}
          <Box>
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "white",
              }}
            >
              <Typography sx={{ marginRight: "8px" }}>{username}</Typography>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ p: 3 }}>
        <Outlet />
      </Box>
      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default AppBarLayout;
