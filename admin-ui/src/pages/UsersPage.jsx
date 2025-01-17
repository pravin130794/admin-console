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
  OutlinedInput,
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
import SnackbarComponent from "../components/Snackbar";

const UserPage = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [approveData, setApproveData] = useState({
    role: "",
    reason: "",
  });
  const [openApprove, setOpenApprove] = useState(false);
  const [reason, setReason] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const [openRegister, setOpenRegister] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [visibleItems, setVisibleItems] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0); // Total count of users
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // Can be 'success', 'error', 'warning', 'info'
  });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
    businessPurpose: "",
    groups: [],
  });

  useEffect(() => {
    if (openRegister || openApprove || openEdit) {
      fetchGroups();
    }
  }, [openRegister, openApprove, openEdit]);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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
      const user_id = localStorage.getItem("user_id");
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:8001/api/v1/groups?user_id=${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setGroups(data.groups);
      setVisibleItems(data.groups.slice(0, 10));
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleScroll = (event) => {
    const bottom =
      event.target.scrollHeight - event.target.scrollTop <=
      event.target.clientHeight + 10; // Adjust tolerance
    if (bottom && visibleItems.length < groups.length) {
      setVisibleItems((prevVisibleItems) => [
        ...prevVisibleItems,
        ...groups.slice(prevVisibleItems.length, prevVisibleItems.length + 10),
      ]);
    }
  };
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const user_id = localStorage.getItem("user_id");
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:8001/api/v1/users?user_id=${user_id}&skip=${page}&limit=${rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteOpen = (user) => {
    setSelectedUser(user);
    setOpenDelete(true);
  };

  const handleDeleteClose = async () => {
    setOpenDelete(false);
    setReason("");
  };

  const handleDelete = async () => {
    if (!reason) {
      setSnackbar({
        open: true,
        message: "Please provide a reason for deletion.",
        severity: "warning",
      });
      return;
    }
    setApiLoading(true);
    try {
      const user_id = selectedUser.id;
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:8001/api/v1/user/${user_id}/inactivate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: reason,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete user.");
      }

      setSnackbar({
        open: true,
        message: "User deleted successfully!",
        severity: "success",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred.",
        severity: "error",
      });
    } finally {
      setApiLoading(false);
      setOpenDelete(false);
      setReason("");
    }
  };

  const handleViewOpen = (user) => {
    setSelectedUser(user);
    setOpenView(true);
  };

  const handleViewClose = () => {
    setOpenView(false);
    setSelectedUser(null);
  };

  const handleRejectOpen = (user) => {
    setSelectedUser(user);
    setOpenReject(true);
  };

  const handleRejectClose = async () => {
    setOpenReject(false);
    setReason("");
  };

  const handleReject = async () => {
    if (!reason) {
      setSnackbar({
        open: true,
        message: "Please provide a reason for rejection.",
        severity: "warning",
      });
      return;
    }
    setApiLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:8001/api/v1/reject_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reason,
          user_id: selectedUser.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add user.");
      }

      setSnackbar({
        open: true,
        message: "User rejected successfully!",
        severity: "success",
      });
      fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred.",
        severity: "error",
      });
    } finally {
      setApiLoading(false);
      setOpenReject(false);
      setReason("");
    }
  };

  const handleApproveOpen = (user) => {
    setSelectedUser(user);
    setOpenApprove(true);
  };

  const handleApproveClose = () => {
    setOpenApprove(false);
    setApproveData({});
    setRole("");
    setReason("");
  };

  const handleGroupSelect = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedGroups(
      typeof value === "string" ? value.split(",") : value // Ensure multiple selections are handled correctly
    );
  };

  const handleApproveSave = async () => {
    if (
      !selectedUser ||
      approveData?.groups?.length === 0 ||
      !approveData.role
    ) {
      setSnackbar({
        open: true,
        message: "Please select at least one group and role for approval.",
        severity: "warning",
      });
      return;
    }
    const user_id = localStorage.getItem("user_id");

    const requestBody = {
      approver_user_id: user_id, // Replace with actual approver ID
      user_id: selectedUser.id,
      groups: approveData.groups, // Send selected group IDs
      projects: [], // Add projects if applicable
      email: selectedUser.email,
      role: approveData.role,
    };
    const token = localStorage.getItem("authToken");
    setApiLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8001/api/v1/approve_user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setEditedData({
      ...user,
      groups: user.groups.map((group) => group._id), // Map existing groups to their IDs
    });
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
  };

  const handleEditSave = async () => {
    setApiLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:8001/api/v1/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add user.");
      }

      setSnackbar({
        open: true,
        message: "User updated successfully!",
        severity: "success",
      });

      handleEditClose();
      fetchUsers();
    } catch (error) {
      console.error("Error update user:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred.",
        severity: "error",
      });
    } finally {
      setApiLoading(false);
    }
  };

  const handleUpdateInputChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
  };

  const handleApproveInputChange = (field, value) => {
    setApproveData({ ...approveData, [field]: value });
  };

  const validateRegisterForm = () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      username,
      password,
      confirmPassword,
      groups,
      role,
    } = registerData;

    // Helper function to show error in Snackbar
    const showError = (message) => {
      setSnackbar({
        open: true,
        message,
        severity: "error",
      });
      return false;
    };

    // Required Fields Validation
    const requiredFields = [
      { value: firstName, label: "First Name" },
      { value: lastName, label: "Last Name" },
      { value: phone, label: "Phone Number" },
      { value: username, label: "Username" },
      { value: password, label: "Password" },
      { value: confirmPassword, label: "Confirm Password" },
      { value: groups, label: "Groups" },
      { value: role, label: "Role" },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        return showError(`${field.label} is required.`);
      }
    }

    // Phone Number Validation
    const phoneRegex = /^[+]?[0-9]{10,15}$/; // Allows optional "+" and validates 10 to 15 numeric digits
    if (!phoneRegex.test(phone.trim())) {
      return showError("Invalid phone number. Must be 10-15 digits long.");
    }
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return showError("Invalid email format.");
    }

    // Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password.trim())) {
      return showError(
        "Password must include a mix of a-z, A-Z, 0-9, special characters, and be at least 8 characters long."
      );
    }

    // Confirm Password Validation
    if (password !== confirmPassword) {
      return showError("Passwords do not match.");
    }

    // Validation Passed
    setSnackbar({
      open: true,
      message: "Validation successful!",
      severity: "success",
    });
    return true;
  };

  const handleRegisterOpen = () => {
    setRegisterData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      confirmPassword: "",
      groups: [],
      role: "",
      businessPurpose: "",
    });
    setOpenRegister(true);
  };

  const handleRegisterClose = () => {
    setOpenRegister(false);
  };

  const handleRegisterSave = async () => {
    if (!validateRegisterForm()) return;
    setApiLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:8001/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add user.");
      }

      setSnackbar({
        open: true,
        message: "User added successfully!",
        severity: "success",
      });

      handleRegisterClose();
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred.",
        severity: "error",
      });
    } finally {
      setApiLoading(false);
    }
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
          backgroundImage: "linear-gradient(to left, #5A8DFF, #000080)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          height: "45px",
        }}
      >
        <Box sx={{ flex: 1, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold">
            User Management
          </Typography>
        </Box>
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
              {paginatedUsers.length > 0 ? (
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
                        disabled={user.status === "Approved"}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No users found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalUsers}
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
                onClick={handleDelete}
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
                onClick={handleReject}
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
                  Groups:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedUser.groups.map((group) => group.name).join(", ")}
                  </span>
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
                    {selectedUser.businessPurpose}
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
              👤 Approve User
            </Typography>
            <IconButton onClick={handleApproveClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box p={3}>
            <FormControl fullWidth>
              <InputLabel>Groups *</InputLabel>
              <Select
                multiple
                value={approveData.groups || []} // Bind multiple group IDs
                onChange={
                  (e) => handleApproveInputChange("groups", e.target.value) // Update multiple groups
                }
                input={
                  <OutlinedInput id="select-multiple-chip" label="Groups *" />
                }
                renderValue={(selected) =>
                  selected.map((id) => {
                    const group = groups.find((group) => group.id === id);
                    return group ? (
                      <Box
                        key={group.id}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "2px 8px",
                          margin: "2px",
                          backgroundColor: "#e0e0e0",
                          borderRadius: "16px",
                          fontSize: "14px",
                        }}
                      >
                        {group.name}
                      </Box>
                    ) : (
                      "Select Groups"
                    );
                  })
                }
                MenuProps={{
                  PaperProps: {
                    onScroll: handleScroll,
                    style: { maxHeight: 150, overflowY: "auto" },
                  },
                }}
                disabled={loadingGroups} // Disable dropdown while loading
              >
                {loadingGroups ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} /> Loading...
                  </MenuItem>
                ) : visibleItems.length > 0 ? (
                  visibleItems.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem>No groups found</MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              select
              label="Role *"
              value={approveData.role}
              onChange={(e) =>
                setApproveData({ ...approveData, role: e.target.value })
              }
              margin="normal"
            >
              <MenuItem value="SuperAdmin">Super Admin</MenuItem>
              <MenuItem value="GroupAdmin">Group Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Reason"
              value={approveData.reason}
              onChange={(e) =>
                setApproveData({ ...approveData, reason: e.target.value })
              }
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
                <FormControl fullWidth>
                  <InputLabel>Groups *</InputLabel>
                  <Select
                    multiple
                    value={editedData.groups || []} // Bind multiple group IDs
                    onChange={
                      (e) => handleUpdateInputChange("groups", e.target.value) // Update multiple groups
                    }
                    input={
                      <OutlinedInput
                        id="select-multiple-chip"
                        label="Groups *"
                      />
                    }
                    renderValue={(selected) =>
                      selected.map((id) => {
                        const group = groups.find((group) => group.id === id);

                        return group ? (
                          <Box
                            key={group.id}
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "2px 8px",
                              margin: "2px",
                              backgroundColor: "#e0e0e0",
                              borderRadius: "16px",
                              fontSize: "14px",
                            }}
                          >
                            {group.name}
                          </Box>
                        ) : (
                          "Select Groups"
                        );
                      })
                    }
                    MenuProps={{
                      PaperProps: {
                        onScroll: handleScroll,
                        style: { maxHeight: 150, overflowY: "auto" },
                      },
                    }}
                    disabled={loadingGroups} // Disable dropdown while loading
                  >
                    {loadingGroups ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} /> Loading...
                      </MenuItem>
                    ) : visibleItems.length > 0 ? (
                      visibleItems.map((group) => (
                        <MenuItem key={group.id} value={group.id}>
                          {group.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem>No groups found</MenuItem>
                    )}
                  </Select>
                </FormControl>

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
                value={editedData.businessPurpose || ""}
                onChange={(e) =>
                  handleUpdateInputChange("businessPurpose", e.target.value)
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
                <InputLabel>Groups *</InputLabel>
                <Select
                  multiple
                  value={registerData.groups || []} // Bind multiple group IDs
                  onChange={
                    (e) => handleRegisterInputChange("groups", e.target.value) // Update multiple groups
                  }
                  input={
                    <OutlinedInput id="select-multiple-chip" label="Groups *" />
                  }
                  renderValue={(selected) =>
                    selected.map((id) => {
                      const group = groups.find((group) => group.id === id);
                      return group ? (
                        <Box
                          key={group.id}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 8px",
                            margin: "2px",
                            backgroundColor: "#e0e0e0",
                            borderRadius: "16px",
                            fontSize: "14px",
                          }}
                        >
                          {group.name}
                        </Box>
                      ) : (
                        "Select Groups"
                      );
                    })
                  }
                  MenuProps={{
                    PaperProps: {
                      onScroll: handleScroll,
                      style: { maxHeight: 150, overflowY: "auto" },
                    },
                  }}
                  disabled={loadingGroups} // Disable dropdown while loading
                >
                  {loadingGroups ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Loading...
                    </MenuItem>
                  ) : visibleItems.length > 0 ? (
                    visibleItems.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>No groups found</MenuItem>
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
              value={registerData.businessPurpose}
              onChange={(e) =>
                handleRegisterInputChange("businessPurpose", e.target.value)
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
