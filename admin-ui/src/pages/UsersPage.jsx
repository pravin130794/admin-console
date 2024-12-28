import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Modal,
  TextField,
  Paper,
  Select,
  MenuItem,
  Backdrop,
  TablePagination,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InputLabel from "@mui/material/InputLabel";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Cancel";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress";
import { PendingActions } from "@mui/icons-material";
import SnackbarComponent from "../components/Snackbar";

const UserPage = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [openApprove, setOpenApprove] = useState(false);
  const [reason, setReason] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [openRegister, setOpenRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    group: "",
    role: "",
    purpose: "",
  });
  const [apiLoading, setApiLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // Can be 'success', 'error', 'warning', 'info'
  });
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const [groups, setGroups] = useState([]); // State for groups data
  const [loadingGroups, setLoadingGroups] = useState(false); // Loading state for API call
  const [users, setUsers] = useState([]); // State for groups data
  const [loadingUsers, setLoadingUsers] = useState(false); // Loading state for API call

  // Fetch groups data when the modal opens
  useEffect(() => {
    if (openRegister || openApprove) {
      fetchGroups();
    }
  }, [openRegister, openApprove]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };
  const paginatedUsers = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/groups"); // Replace with your API
      const data = await response.json();
      setGroups(data); // Assuming API returns an array of groups
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/users"); // Replace with your API
      const data = await response.json();
      setUsers(data.users); // Assuming API returns an array of users
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Open Delete Modal
  const handleDeleteOpen = (user) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  // Close Delete Modal
  const handleDeleteClose = () => {
    setOpenDelete(false);
    setReason("");
  };

  // Open View User Details Modal
  const handleViewOpen = (user) => {
    setSelectedUser(user);
    setOpenView(true);
  };

  // Close View Modal
  const handleViewClose = () => {
    setOpenView(false);
    setSelectedUser(null);
  };

  // Handlers for Reject Modal
  const handleRejectOpen = (user) => {
    setSelectedUser(user);
    setOpenReject(true);
  };
  const handleRejectClose = () => {
    setOpenReject(false);
    setReason("");
  };

  // Approve Modal Handlers
  const handleApproveOpen = (user) => {
    setSelectedUser(user);
    setOpenApprove(true);
  };

  const handleApproveClose = () => {
    setOpenApprove(false);
    setSelectedGroups([]);
    setRole("");
    setReason("");
  };

  const handleGroupSelect = (event) => {
    const {
      target: { value },
    } = event;
    console.log("Selected Groups:", event);
    setSelectedGroups(
      typeof value === "string" ? value.split(",") : value // Ensure multiple selections are handled correctly
    );
  };

  const handleApproveSave = async () => {
    if (!selectedUser || selectedGroups.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one group and provide a reason.",
        severity: "warning",
      });
      return;
    }
    const user_id = localStorage.getItem("user_id");

    const requestBody = {
      approver_user_id: user_id, // Replace with actual approver ID
      user_id: selectedUser.id,
      groups: selectedGroups, // Send selected group IDs
      projects: [], // Add projects if applicable
      email: selectedUser.email,
    };
    setApiLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/approve_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to approve user");
      }

      const data = await response.json();
      setSnackbar({
        open: true,
        message: `User ${selectedUser.username} approved successfully!`,
        severity: "success",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred while approving the user",
        severity: "error",
      });
    } finally {
      setApiLoading(false);
      handleApproveClose();
    }
  };

  // Open Edit User Modal
  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setEditedData(user); // Pre-fill form with selected user's data
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setEditedData({});
  };

  const handleEditSave = () => {
    console.log("Updated User Data:", editedData);
    handleEditClose();
  };

  // Handle Input Changes
  const handleUpdateInputChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
  };

  // Open Register User Modal
  const handleRegisterOpen = () => {
    setRegisterData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      confirmPassword: "",
      group: "",
      role: "",
      purpose: "",
    });
    setOpenRegister(true);
  };

  const handleRegisterClose = () => {
    setOpenRegister(false);
  };

  const handleRegisterSave = () => {
    console.log("Registered User Data:", registerData);
    handleRegisterClose();
  };

  const handleRegisterInputChange = (field, value) => {
    setRegisterData({ ...registerData, [field]: value });
  };
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#001a99",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          User Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#ffffff", marginRight: "10px" }}
            onClick={handleRegisterOpen}
          >
            <Typography variant="h8" fontWeight="bold" color="#001a99">
              + Add User
            </Typography>
          </Button>
          <Button variant="contained" sx={{ backgroundColor: "#ffffff" }}>
            <Typography variant="h8" fontWeight="bold" color="#001a99">
              + Add Group
            </Typography>
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Box mt={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#001a99" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  SN. No
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Username
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Email
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Registration Status
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers &&
                paginatedUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.status === "Approved" ? (
                        <Box
                          sx={{
                            color: "green",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <CheckCircleIcon sx={{ marginRight: "5px" }} />
                          Approved
                        </Box>
                      ) : user.status === "Rejected" ? (
                        <Box
                          sx={{
                            color: "red",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <CancelIcon sx={{ marginRight: "5px" }} />
                          Rejected
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            color: "Blue",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <AccessTimeIcon sx={{ marginRight: "5px" }} />
                          Pending
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewOpen(user)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteOpen(user)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        color="warning"
                        onClick={() => handleRejectOpen(user)}
                      >
                        <CancelIcon />
                      </IconButton>
                      <IconButton
                        color="success"
                        onClick={() => handleApproveOpen(user)}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleEditOpen(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* Pagination */}
      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />
      {/* Delete User Modal */}
      <Modal open={openDelete} onClose={handleDeleteClose}>
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
          <Box
            sx={{
              backgroundColor: "#001a99",
              color: "white",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              👤 Delete User
            </Typography>
            <IconButton onClick={handleDeleteClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box p={3}>
            <TextField
              fullWidth
              label="Reason *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason"
            />
            <Box textAlign="right" mt={2}>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #f12711, #f5af19)",
                  color: "white",
                }}
                onClick={handleDeleteClose}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Reject User Modal */}
      <Modal open={openReject} onClose={handleRejectClose}>
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
          <Box
            sx={{
              backgroundColor: "#001a99",
              color: "white",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              👤 Reject User
            </Typography>
            <IconButton onClick={handleRejectClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box p={3}>
            <TextField
              fullWidth
              label="Reason *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason"
            />
            <Box textAlign="right" mt={2}>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #f12711, #f5af19)",
                  color: "white",
                }}
                onClick={handleRejectClose}
              >
                Reject
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* View User Details Modal */}
      <Modal open={openView} onClose={handleViewClose}>
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
              backgroundColor: "#001a99",
              color: "white",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              👤 User Details
            </Typography>
            <IconButton onClick={handleViewClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* User Details Content */}
          {selectedUser && (
            <Box sx={{ padding: "20px" }}>
              {/* First Row */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px 20px",
                  marginBottom: "10px",
                }}
              >
                <Typography fontWeight="bold">
                  First Name:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedUser.firstName}
                  </span>
                </Typography>
                <Typography fontWeight="bold">
                  Group:{" "}
                  <span style={{ color: "orange" }}>{selectedUser.group}</span>
                </Typography>
              </Box>

              {/* Second Row */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px 20px",
                  marginBottom: "10px",
                }}
              >
                <Typography fontWeight="bold">
                  Last Name:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedUser.lastName}
                  </span>
                </Typography>
                <Typography fontWeight="bold">
                  Role:{" "}
                  <span style={{ color: "orange" }}>{selectedUser.role}</span>
                </Typography>
              </Box>

              {/* Third Row */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px 20px",
                  marginBottom: "10px",
                }}
              >
                <Typography fontWeight="bold">
                  Phone No:{" "}
                  <span style={{ color: "orange" }}>{selectedUser.phone}</span>
                </Typography>
                <Typography fontWeight="bold">
                  Business Purpose:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedUser.purpose}
                  </span>
                </Typography>
              </Box>

              {/* Fourth Row */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <Typography fontWeight="bold">
                  Email:{" "}
                  <span style={{ color: "orange" }}>{selectedUser.email}</span>
                </Typography>
                <Typography fontWeight="bold">
                  Username:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedUser.username}
                  </span>
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Approve User Modal */}
      <Modal open={openApprove} onClose={handleApproveClose}>
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
          <Box
            sx={{
              backgroundColor: "#001a99",
              color: "white",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              👤 Approve User
            </Typography>
            <IconButton onClick={handleApproveClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box p={3}>
            <FormControl fullWidth>
              <InputLabel>Group *</InputLabel>
              <Select
                value={selectedGroups[0]}
                onChange={handleGroupSelect}
                // renderValue={(selected) => {
                //   selected.map(
                //     (id) => groups.find((group) => group._id === id)?.name
                //   );
                // }}
                disabled={loadingGroups} // Disable dropdown while loading
              >
                {loadingGroups ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} /> Loading...
                  </MenuItem>
                ) : (
                  groups.map((group) => (
                    <MenuItem key={group.id} value={group._id}>
                      {group.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              select
              label="Role *"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              margin="normal"
            >
              <MenuItem value="SuperAdmin">Super Admin</MenuItem>
              <MenuItem value="GroupAdmin">Group Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              margin="normal"
              placeholder="Enter reason"
            />
            <Box textAlign="right" mt={2}>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #f12711, #f5af19)",
                  color: "white",
                }}
                onClick={handleApproveSave}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Edit User Details*/}
      <Modal open={openEdit} onClose={handleEditClose}>
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
              backgroundColor: "#001a99",
              color: "white",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              📝 Edit User
            </Typography>
            <IconButton onClick={handleEditClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form */}
          {selectedUser && (
            <Box sx={{ p: 3 }}>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="First Name *"
                  value={editedData.firstName || ""}
                  onChange={(e) =>
                    handleUpdateInputChange("firstName", e.target.value)
                  }
                />
                <TextField
                  label="Last Name *"
                  value={editedData.lastName || ""}
                  onChange={(e) =>
                    handleUpdateInputChange("lastName", e.target.value)
                  }
                />
                <TextField
                  label="Email *"
                  value={editedData.email || ""}
                  disabled
                />
                <TextField
                  label="Phone *"
                  value={editedData.phone || ""}
                  onChange={(e) =>
                    handleUpdateInputChange("phone", e.target.value)
                  }
                />
                <TextField
                  label="Group *"
                  value={editedData.group || ""}
                  onChange={(e) =>
                    handleUpdateInputChange("group", e.target.value)
                  }
                />
                <Box sx={{ minWidth: 120 }}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Role</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Role *"
                      value={editedData.role || ""}
                      onChange={(e) =>
                        handleUpdateInputChange("role", e.target.value)
                      }
                    >
                      <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                      <MenuItem value="GroupAdmin">Group Admin</MenuItem>
                      <MenuItem value="User">User</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <TextField
                fullWidth
                margin="normal"
                label="Business Purpose"
                value={editedData.purpose || ""}
                onChange={(e) =>
                  handleUpdateInputChange("purpose", e.target.value)
                }
              />
              <Box textAlign="right" mt={2}>
                <Button
                  variant="contained"
                  sx={{
                    background: "linear-gradient(to right, #f12711, #f5af19)",
                    color: "white",
                  }}
                  onClick={handleEditSave}
                >
                  Save
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Register User Modal */}
      <Modal open={openRegister} onClose={handleRegisterClose}>
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
              backgroundColor: "#001a99",
              color: "white",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              👤 Register User
            </Typography>
            <IconButton onClick={handleRegisterClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form */}
          <Box sx={{ p: 3 }}>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="First Name *"
                value={registerData.firstName}
                onChange={(e) =>
                  handleRegisterInputChange("firstName", e.target.value)
                }
              />
              <TextField
                label="Last Name *"
                value={registerData.lastName}
                onChange={(e) =>
                  handleRegisterInputChange("lastName", e.target.value)
                }
              />
              <TextField
                label="Email *"
                value={registerData.email}
                onChange={(e) =>
                  handleRegisterInputChange("email", e.target.value)
                }
              />
              <TextField
                label="Phone *"
                value={registerData.phone}
                onChange={(e) =>
                  handleRegisterInputChange("phone", e.target.value)
                }
              />
              <TextField
                label="Username *"
                value={registerData.username}
                onChange={(e) =>
                  handleRegisterInputChange("username", e.target.value)
                }
              />
              <TextField
                label="Password *"
                type="password"
                value={registerData.password}
                onChange={(e) =>
                  handleRegisterInputChange("password", e.target.value)
                }
              />
              <TextField
                label="Confirm Password *"
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  handleRegisterInputChange("confirmPassword", e.target.value)
                }
              />

              <FormControl fullWidth>
                <InputLabel>Group *</InputLabel>
                <Select
                  value={registerData.group}
                  onChange={(e) =>
                    handleRegisterInputChange("group", e.target.value)
                  }
                  disabled={loadingGroups} // Disable dropdown while loading
                >
                  {loadingGroups ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Loading...
                    </MenuItem>
                  ) : (
                    groups.map((group) => (
                      <MenuItem key={group.id} value={group.name}>
                        {group.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <Select
                value={registerData.role}
                onChange={(e) =>
                  handleRegisterInputChange("role", e.target.value)
                }
                displayEmpty
                renderValue={(selected) => (selected ? selected : "Role *")}
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="GroupAdmin">Group Admin</MenuItem>
                <MenuItem value="SuperAdmin">Super Admin</MenuItem>
              </Select>
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="Business Purpose"
              value={registerData.purpose}
              onChange={(e) =>
                handleRegisterInputChange("purpose", e.target.value)
              }
            />
            <Box textAlign="right" mt={2}>
              <Button
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #f12711, #f5af19)",
                  color: "white",
                }}
                onClick={handleRegisterSave}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      {/* Snackbar for alerts */}
      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
      {/* Backdrop Loader */}
      <Backdrop open={apiLoading} sx={{ color: "#fff", zIndex: 1301 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default UserPage;
