import React from "react";
import axios from "axios";
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, Outlet, useNavigate } from "react-router-dom";
import SnackbarComponent from "../components/Snackbar";
import { useAuth } from "../context/Auth";

const drawerWidth = 240;

const SidebarLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleLogout = async () => {
    try {
      // Call the logout API

      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:8000/api/v1/logout", {
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
      console.log("🚀 ~ handleLogout ~ error:", error);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column", // Stack items vertically
            justifyContent: "space-between", // Push the Logout button to the bottom
          },
        }}
      >
        {/* Sidebar Menu */}
        <List>
          <ListItem button component={Link} to="/">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button component={Link} to="/users">
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
          <ListItem button component={Link} to="/groups">
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Groups" />
          </ListItem>
          <ListItem button component={Link} to="/devices">
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Devices" />
          </ListItem>
        </List>

        {/* Logout Button */}
        <Box sx={{ p: 2 }}>
          <Button
            variant="outlined"
            color="info"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Outlet />
      </Box>
      {/* Reusable Snackbar Component */}
      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default SidebarLayout;
