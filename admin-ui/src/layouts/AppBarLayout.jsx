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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{}}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Logo Section */}
          <Box display="flex" alignItems="center">
            <img
              src={SapphireLogo}
              alt="Sapphire Logo"
              style={{ height: "80px" }}
            />
          </Box>

          {/* Navigation Links */}
          <Box>
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
              to="/devices"
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "16px",
              }}
            >
              Devices
            </Button>
          </Box>

          {/* User Avatar */}
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "white",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {/* <Avatar
                alt="User Avatar"
                src="https://i.pravatar.cc/300"
                sx={{ width: 40, height: 40 }}
              /> */}

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
