import React, { useState, useEffect, useRef } from "react";
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
  Paper,
  Backdrop,
  TablePagination,
  Modal,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CircularProgress from "@mui/material/CircularProgress";
import SnackbarComponent from "../components/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import ApiBaseUrl from "../ApiBaseUrl";

const HostsPage = () => {
  const [hosts, setHosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalHosts, setTotalHosts] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingGrous, setLoadingGroups] = useState(false);
  const [projects, setProjects] = useState([]);
  const [openDeviceModel, setOpenDeviceModel] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [open, setOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [groups, setGroups] = useState([]);
  const [visibleProjectItems, setProjectVisibleItems] = useState([]);
  const [visibleGroupItems, setGroupVisibleItems] = useState([]);
  const [openRegister, setOpenRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: "",
    location: "",
    os: "",
    ipAddress: "",
    projectId: "",
    groupId: "",
    member: localStorage.getItem("user_id"),
  });
  const [apiLoading, setApiLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const descriptionElementRef = useRef(null);
  const [scroll, setScroll] = useState("paper");
  const [deviceList, setDeviceList] = useState([]);
  const [editData, setEditData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (openRegister) {
      fetchProjects();
      fetchGroups();
    }
  }, [openRegister]);

  const handleOpen = (host) => {
    setOpen(true);
    setScroll("paper");
    fetchDevices(host.devices);
    setEditData(host);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDevices([]);
  };

  const handleApprove = async () => {
    setApiLoading(true);
    try {
      editData.devices = selectedDevices;
      editData.group = editData.group.id;
      editData.project = editData.project.id;
      const token = localStorage.getItem("authToken");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(`http://${baseUrl}/api/v1/hosts`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update host.");
      }

      setSnackbar({
        open: true,
        message: "Host updated successfully!",
        severity: "success",
      });

      setOpen(false);
      fetchDevices(hosts.devices);
      fetchHosts();
    } catch (error) {
      console.error("Error update host:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred.",
        severity: "error",
      });
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  // Handle Checkbox Selection
  const handleCheckboxChange = (deviceId) => {
    setSelectedDevices((prevSelected) => {
      if (prevSelected.includes(deviceId)) {
        return prevSelected.filter((id) => id !== deviceId);
      } else {
        return [...prevSelected, deviceId];
      }
    });
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async (devices = []) => {
    setLoadingDevices(true);
    try {
      const token = localStorage.getItem("authToken");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(`http://${baseUrl}/api/v1/devices/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setDeviceList(data.devices);
      const assignedDeviceIds = devices.map((device) => device.id);
      setSelectedDevices(assignedDeviceIds);
    } catch (error) {
      console.error("Error fetching device:", error);
    } finally {
      setLoadingDevices(false);
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const user_id = localStorage.getItem("user_id");
      const token = localStorage.getItem("authToken");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(
        `http://${baseUrl}/api/v1/projects?user_id=${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setProjects(data.projects);
      setProjectVisibleItems(data.projects.slice(0, 10));
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const user_id = localStorage.getItem("user_id");
      const token = localStorage.getItem("authToken");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(
        `http://${baseUrl}/api/v1/groups?user_id=${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setGroups(data.groups);
      setGroupVisibleItems(data.groups.slice(0, 10));
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  const fetchHosts = async () => {
    setApiLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const user_id = localStorage.getItem("user_id");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(
        `http://${baseUrl}/api/v1/hosts?user_id=${user_id}&skip=${page}&limit=${rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ); // Replace with your API
      const data = await response.json();
      setHosts(data.hosts); // Assuming API returns an array of hosts
      setTotalHosts(data.total || 0);
    } catch (error) {
      console.error("Error fetching hosts:", error);
    } finally {
      setApiLoading(false);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const validateRegisterForm = () => {
    const { name, location, os, ipAddress, projectId, groupId } = registerData;

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
      { value: name, label: "Host Name" },
      { value: location, label: "Location" },
      { value: os, label: "OS" },
      { value: ipAddress, label: "IP Address" },
      { value: projectId, label: "Project" },
      { value: groupId, label: "Group" },
    ];

    for (const field of requiredFields) {
      if (!field.value) {
        return showError(`${field.label} is required.`);
      }
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
      name: "",
      projectId: "",
      groupId: "",
      os: "",
      ipAddress: "",
      location: "",
      member: localStorage.getItem("user_id"),
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
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(`http://${baseUrl}/api/v1/hosts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add host.");
      }

      setSnackbar({
        open: true,
        message: "Host added successfully!",
        severity: "success",
      });

      handleRegisterClose();
      fetchHosts();
    } catch (error) {
      console.error("Error adding host:", error);
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

  const filteredDevices = deviceList.filter((device) =>
    device.model.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <Box>
      {/* Header */}

      <Typography
        variant="h8"
        fontWeight="bold"
        onClick={handleRegisterOpen}
        display="flex"
        justifyContent="end"
      >
        <AddCircleOutlineIcon />
        Add Host
      </Typography>

      {/* Table */}
      <Box mt={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead
              sx={{
                backgroundImage:
                  "linear-gradient(to left,rgb(1,223,170),rgb(3,201,114),rgb(2,176,54))",
              }}
            >
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  SN. No
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Host Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  IP Address
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Location
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Assigned Projects
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Assigned Groups
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  OS
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  No. of Device
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hosts.length > 0 ? (
                hosts.map((host, index) => (
                  <TableRow key={host.id || `host-${index}`}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{host.name}</TableCell>
                    <TableCell>{host.ipAddress}</TableCell>
                    <TableCell>{host.location}</TableCell>
                    <TableCell>{host.project.name}</TableCell>
                    <TableCell>{host.group.name}</TableCell>
                    <TableCell>{host.os}</TableCell>
                    <TableCell
                      onClick={() => handleOpen(host)}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      {host.devices.length}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No hosts found.
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
        count={totalHosts}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />

      {/* Register Host Modal */}
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
              👤 Register Host
            </Typography>
            <IconButton onClick={handleRegisterClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form */}
          <Box sx={{ p: 3 }}>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Name *"
                value={registerData.name}
                onChange={(e) =>
                  handleRegisterInputChange("name", e.target.value)
                }
              />
              <TextField
                label="IP Address *"
                value={registerData.ipAddress}
                onChange={(e) =>
                  handleRegisterInputChange("ipAddress", e.target.value)
                }
              />
              <TextField
                label="Location *"
                value={registerData.location}
                onChange={(e) =>
                  handleRegisterInputChange("location", e.target.value)
                }
              />
              <TextField
                label="OS *"
                value={registerData.os}
                onChange={(e) =>
                  handleRegisterInputChange("os", e.target.value)
                }
              />
              <FormControl fullWidth>
                <InputLabel>Project *</InputLabel>
                <Select
                  value={registerData.projectId || ""} // Bind single project ID
                  onChange={(e) =>
                    handleRegisterInputChange("projectId", e.target.value)
                  } // Update single project
                  input={<OutlinedInput id="select-single" label="Project *" />}
                  MenuProps={{
                    PaperProps: {
                      onScroll: handleScroll,
                      style: { maxHeight: 150, overflowY: "auto" },
                    },
                  }}
                  disabled={loadingProjects} // Disable dropdown while loading
                >
                  {loadingProjects ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Loading...
                    </MenuItem>
                  ) : visibleProjectItems.length > 0 ? (
                    visibleProjectItems.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>No projects found</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Group *</InputLabel>
                <Select
                  value={registerData.groupId || ""} // Bind single group ID
                  onChange={(e) =>
                    handleRegisterInputChange("groupId", e.target.value)
                  } // Update single group
                  input={<OutlinedInput id="select-single" label="Group *" />}
                  MenuProps={{
                    PaperProps: {
                      onScroll: handleScroll,
                      style: { maxHeight: 150, overflowY: "auto" },
                    },
                  }}
                  disabled={loadingGrous} // Disable dropdown while loading
                >
                  {loadingGrous ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Loading...
                    </MenuItem>
                  ) : visibleGroupItems.length > 0 ? (
                    visibleGroupItems.map((group) => (
                      <MenuItem key={group.id} value={group.id}>
                        {group.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>No groups found</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
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

      {/* Scrollable Device List Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle
          sx={{
            backgroundImage:
              "linear-gradient(to left,rgb(1,223,170),rgb(3,201,114),rgb(2,176,54))",
          }}
          id="scroll-dialog-title"
        >
          Select Devices
        </DialogTitle>
        {/* Search Bar */}
        <Box sx={{ padding: "10px 20px" }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search Devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        <DialogContent dividers={scroll === "paper"}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            {filteredDevices.length > 0 ? (
              filteredDevices.map((device) => (
                <Box key={device.id} display="flex" alignItems="center">
                  <Checkbox
                    checked={selectedDevices.includes(device.id)}
                    onChange={() => handleCheckboxChange(device.id)}
                  />
                  <Typography>{device.model}</Typography>
                </Box>
              ))
            ) : (
              <Typography>No devices available</Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{ color: "blue", fontWeight: "bold" }}
          >
            CLOSE
          </Button>
          <Button
            onClick={handleApprove}
            sx={{ color: "blue", fontWeight: "bold" }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

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

export default HostsPage;
