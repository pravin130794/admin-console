import { React, useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Alert,
  Typography,
  Box,
  Button,
  IconButton,
  Badge,
  Modal,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SapphireLogo from "../assets/SapphireLogo.png";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Auth";
import { useRecoilCallback } from "recoil";
import SnackbarComponent from "../components/Snackbar";
import ApiBaseUrl from "../ApiBaseUrl";
import CloseIcon from "@mui/icons-material/Close";
import {
  selectedDeviceAccordion,
  selectedDeviceModelBody,
  selectedDeviceModelName,
  selectedDeviceUrl,
} from "../services/recoilState";

const AppBarLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const userRole = localStorage.getItem("role");
  const username = localStorage.getItem("username");
  const location = useLocation(); // Get the current location
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [loadingPendingRequest, setLoadingPendingRequest] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [openReqModel, setOpenReqModel] = useState(false);
  const resetAllAtoms = useRecoilCallback(
    ({ reset }) =>
      () => {
        reset(selectedDeviceAccordion);
        reset(selectedDeviceModelBody);
        reset(selectedDeviceUrl);
        reset(selectedDeviceModelName);
      },
    []
  );

  const [notificationLists, setNotificationLists] = useState([]);
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [openNotificationModel, setOpenNotificationModel] = useState(false);

  const handleNotificationModelOpen = () => {
    setOpenNotificationModel(true);
  };

  const handleNotificationModelClose = () => {
    setOpenNotificationModel(false);
  };

  const handleRequestModelOpen = () => {
    setOpenReqModel(true);
  };

  const handleRequestModelClose = () => {
    setOpenReqModel(false);
  };

  const fetchPendingRequest = async () => {
    setLoadingPendingRequest(true);
    try {
      const token = localStorage.getItem("authToken");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(`http://${baseUrl}/api/v1/admin/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      console.error("Error fetching pending request:", error);
    } finally {
      setLoadingPendingRequest(false);
    }
  };

  const fetchNotificationRequest = async () => {
    setLoadingNotification(true);
    try {
      const token = localStorage.getItem("authToken");
      const user_id = localStorage.getItem("user_id");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(
        `http://${baseUrl}/api/v1/notifications/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setNotificationLists(data.notifications);
    } catch (error) {
      console.error("Error fetching pending request:", error);
    } finally {
      setLoadingNotification(false);
    }
  };

  const markAsRead = async (notificationId) => {
    const baseUrl = ApiBaseUrl.getBaseUrl();
    const token = localStorage.getItem("authToken");
    await fetch(
      `http://${baseUrl}/api/v1/notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Update state to reflect read status
    setNotificationLists(
      notificationLists.map((notif) => {
        return notif.id === notificationId
          ? { ...notif, is_read: true }
          : notif;
      })
    );
    fetchNotificationRequest();
  };

  const handleAction = async (deviceId, action) => {
    try {
      const token = localStorage.getItem("authToken");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(
        `http://${baseUrl}/api/v1/admin/request/${deviceId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete user.");
      }

      setSnackbar({
        open: true,
        message: "Request updated successfully!",
        severity: "success",
      });
      fetchPendingRequest();
    } catch (error) {
      console.error("Error fetching pending request:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchPendingRequest();
    if (userRole == "User") {
      fetchNotificationRequest();
    }
  }, []);
  const handleLogout = async () => {
    try {
      // Call the logout API

      const token = localStorage.getItem("authToken");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(`http://${baseUrl}/api/v1/logout`, {
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
      // Reset all recoil states
      resetAllAtoms();
      setSnackbar({
        open: true,
        message: "Logout successful!",
        severity: "success",
      });
      // Navigate to the login page
      setTimeout(() => {
        logout();
        navigate("/");
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
      <AppBar position="static" sx={{ backgroundColor: "#fcfcfc" }}>
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
                style={{ height: "20px", marginRight: "8px" }}
              />
            </Box>

            {/* Navigation Links */}
            <Box display="flex">
              <Button
                component={Link}
                to="/devices"
                sx={{
                  backgroundColor: isActive("/devices")
                    ? "#5A8DFF"
                    : "transparent", // Highlight active button
                  color: isActive("/devices") ? "white" : "black",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: isActive("/devices")
                      ? "#5A8DFF"
                      : "#5A8DFF",
                    color: "white",
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
                    ? "#5A8DFF"
                    : "transparent", // Highlight active button
                  color: isActive("/users") ? "white" : "black",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: isActive("/users") ? "#5A8DFF" : "#5A8DFF",
                    color: "white",
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
                    ? "#5A8DFF"
                    : "transparent", // Highlight active button
                  color: isActive("/groups") ? "white" : "black",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: isActive("/groups")
                      ? "#5A8DFF"
                      : "#5A8DFF",
                    color: "white",
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
                    ? "#5A8DFF"
                    : "transparent", // Highlight active button
                  color: isActive("/projects") ? "white" : "black",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: isActive("/projects")
                      ? "#5A8DFF"
                      : "#5A8DFF",
                    color: "white",
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
                    ? "#5A8DFF"
                    : "transparent", // Highlight active button
                  color: isActive("/hosts") ? "white" : "black",
                  marginRight: "16px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: isActive("/hosts") ? "#5A8DFF" : "#5A8DFF",
                    color: "white",
                  },
                }}
              >
                Hosts
              </Button>
            </Box>
          </Box>

          {/* User Logout */}
          <Box
            sx={{
              display: "flex",
              alignItems: "space-between",
              gap: "16px", //
            }}
          >
            {userRole != "User" ? (
              <Badge
                badgeContent={
                  pendingRequests.length > 0 ? pendingRequests.length : "0"
                }
                color="error"
                sx={{ marginRight: "10px", marginTop: "10px" }}
              >
                <NotificationsIcon
                  color="primary"
                  onClick={handleRequestModelOpen}
                />
              </Badge>
            ) : (
              ""
            )}

            {userRole == "User" ? (
              <Badge
                badgeContent={
                  notificationLists.length > 0 ? notificationLists.length : "0"
                }
                color="error"
                sx={{ marginRight: "10px", marginTop: "10px" }}
              >
                <NotificationsIcon
                  color="primary"
                  onClick={handleNotificationModelOpen}
                />
              </Badge>
            ) : (
              ""
            )}
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "black",
                "&:hover": {
                  backgroundColor: isActive("/logout") ? "#5A8DFF" : "#5A8DFF",
                  color: "white",
                },
                borderRadius: "5px",
                gap: "5px",
              }}
            >
              <Typography sx={{ marginRight: "8px", fontWeight: "bold" }}>
                {username}
              </Typography>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ p: 3 }}>
        <Outlet />
      </Box>

      {/* View Request  Modal */}
      <Modal open={openReqModel} onClose={handleRequestModelClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            backgroundColor: "white",
            boxShadow: 24,
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundImage:
                "linear-gradient(to left, #5A8DFF, #001a99, #000080)",
              color: "white",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              👤 Pending Requests
            </Typography>
            <IconButton
              onClick={handleRequestModelClose}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Request List */}
          <Box sx={{ padding: "20px" }}>
            {pendingRequests.length > 0 ? (
              <List>
                {pendingRequests.map((req) => (
                  <div key={req.device_id}>
                    <ListItem
                      sx={{
                        paddingLeft: "5px", // Add left padding
                        paddingRight: "5px", // Add right padding
                        display: "flex",
                        alignItems: "center",
                        gap: "10px", //
                      }}
                    >
                      <ListItemText
                        primary={`Device: ${req.device_name}`}
                        secondary={`Requested By: ${req.requested_by}`}
                      />
                      <Button
                        variant="contained"
                        color="success"
                        sx={{ mr: 1 }}
                        onClick={() =>
                          handleAction(req.device_id, "registered")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleAction(req.device_id, "reject")}
                      >
                        Reject
                      </Button>
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            ) : (
              <Typography variant="body1" align="center">
                No pending requests found.
              </Typography>
            )}
          </Box>
        </Box>
      </Modal>

      {/* View Notification  Modal */}
      <Modal
        open={openNotificationModel}
        onClose={handleNotificationModelClose}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            backgroundColor: "white",
            boxShadow: 24,
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundImage:
                "linear-gradient(to left, #5A8DFF, #001a99, #000080)",
              color: "white",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              👤 Notification
            </Typography>
            <IconButton
              onClick={handleNotificationModelClose}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Request List */}
          <Box sx={{ padding: "20px" }}>
            {loadingNotification ? (
              <Typography variant="body1" align="center">
                Loading...
              </Typography>
            ) : notificationLists.length > 0 ? (
              <List>
                {notificationLists.map((nReq) => (
                  <div key={nReq.id}>
                    <ListItem
                      sx={{
                        paddingLeft: "5px",
                        paddingRight: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: nReq.is_read ? "#f1f1f1" : "white", // Change color if read
                        color: nReq.is_read ? "gray" : "black",
                        cursor: nReq.is_read ? "not-allowed" : "pointer",
                      }}
                      onClick={() => markAsRead(nReq.id)}
                    >
                      <ListItemText
                        primary={nReq.message}
                        secondary={nReq.createdAt}
                      />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
              </List>
            ) : (
              <Typography variant="body1" align="center">
                No Notifications found.
              </Typography>
            )}
          </Box>
        </Box>
      </Modal>
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
