import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SapphireLogo from "../assets/SapphireLogo.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import AndroidIcon from "@mui/icons-material/Android";
import { useAuth } from "../context/Auth";

const AppBarLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "#001a99" }}>
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
                  color: "white",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                }}
              >
                Devices
              </Button>
              <Button
                component={Link}
                to="/users"
                sx={{
                  color: "white",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                }}
              >
                Users
              </Button>
              <Button
                component={Link}
                to="/groups"
                sx={{
                  color: "white",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                }}
              >
                Groups
              </Button>
              <Button
                component={Link}
                to="/projects"
                sx={{
                  color: "white",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                }}
              >
                Projects
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
    </Box>
  );
};

export default AppBarLayout;
