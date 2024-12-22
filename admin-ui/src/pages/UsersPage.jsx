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

// Sample User Data
const users1 = [
  {
    id: 1,
    firstName: "Brian",
    lastName: "Lord",
    phone: "2657456781",
    email: "Brian123@gmail.com",
    username: "Brian123",
    group: "A",
    role: "SuperAdmin",
    purpose: "Test",
    status: "Approved",
  },
  {
    id: 2,
    firstName: "Alex",
    lastName: "Smith",
    phone: "1234567890",
    email: "alex@gmail.com",
    username: "Alex123",
    group: "B",
    role: "GroupAdmin",
    purpose: "Project",
    status: "Rejected",
  },
  {
    id: 3,
    firstName: "Den",
    lastName: "SmithJoe",
    phone: "1234563890",
    email: "Den@gmail.com",
    username: "Den123",
    group: "C",
    role: "User",
    purpose: "Project",
    status: "Pending",
  },
];

const UserPage = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [openApprove, setOpenApprove] = useState(false);
  const [reason, setReason] = useState("");
  const [group, setGroup] = useState("");
  const [role, setRole] = useState("");
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

  const [groups, setGroups] = useState([]); // State for groups data
  const [loadingGroups, setLoadingGroups] = useState(false); // Loading state for API call
  const [users, setUsers] = useState([]); // State for groups data
  const [loadingUsers, setLoadingUsers] = useState(false); // Loading state for API call

  // Fetch groups data when the modal opens
  useEffect(() => {
    if (openRegister) {
      fetchGroups();
    }
  }, [openRegister]);

  useEffect(() => {
    fetchUsers();
  }, []);

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
      setUsers(data.users); // Assuming API returns an array of groups
    } catch (error) {
      console.error("Error fetching groups:", error);
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
    setGroup("");
    setRole("");
    setReason("");
  };

  const handleApproveSave = () => {
    console.log(
      "Approved User:",
      selectedUser,
      "Group:",
      group,
      "Role:",
      role,
      "Reason:",
      reason
    );
    handleApproveClose();
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
        <Typography variant="h6" fontWeight="bold">
          SAPPHIRE
        </Typography>
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
              {users &&
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index}</TableCell>
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
            <TextField
              fullWidth
              select
              label="Group *"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              margin="normal"
            >
              <MenuItem value="A">Group A</MenuItem>
              <MenuItem value="B">Group B</MenuItem>
            </TextField>
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
    </Box>
  );
};

export default UserPage;
