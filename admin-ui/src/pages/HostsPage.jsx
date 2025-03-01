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
  Collapse,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CircularProgress from "@mui/material/CircularProgress";
import SnackbarComponent from "../components/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ApiBaseUrl from "../ApiBaseUrl";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";

const HostsPage = () => {
  const [hosts, setHosts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalHosts, setTotalHosts] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [projects, setProjects] = useState([]);
  const [openDeviceModel, setOpenDeviceModel] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [open, setOpen] = useState(false);
  const [collapsibleOpen, setcollapsibleOpen] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [groups, setGroups] = useState([]);
  const [visibleProjectItems, setProjectVisibleItems] = useState([]);
  const [visibleGroupItems, setGroupVisibleItems] = useState([]);
  const [openRegister, setOpenRegister] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editHostData, setEditHostData] = useState({});
  const [registerData, setRegisterData] = useState({
    name: "",
    location: "",
    os: "",
    ipAddress: "",
    project: [],
    group: [],
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
  const [selectedHost, setSelectedHost] = useState(null);
  const [reason, setReason] = useState("");
  const [openDelete, setOpenDelete] = useState(false);
  const [openActionView, setOpenActionView] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const userRole = localStorage.getItem("role");
  const [openView, setOpenView] = useState(false);

  const toggleRow = (index) => {
    setcollapsibleOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    if (openRegister || openEdit) {
      fetchProjects();
      fetchGroups();
    }
  }, [openRegister, openEdit]);

  const handleOpen = (host) => {
    setOpen(true);
    setScroll("paper");
    fetchDevices(host.devices);
    setEditData(host);
  };
  const handleViewOpen = (host) => {
    setSelectedHost(host);
    setOpenView(true);
  };

  const handleViewClose = () => {
    setOpenView(false);
    setSelectedHost(null);
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
    fetchDevices();
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

  const handleGroupScroll = (event) => {
    const bottom =
      event.target.scrollHeight - event.target.scrollTop <=
      event.target.clientHeight + 10; // Adjust tolerance
    if (bottom && visibleGroupItems.length < groups.length) {
      setGroupVisibleItems((prevVisibleItems) => [
        ...prevVisibleItems,
        ...groups.slice(prevVisibleItems.length, prevVisibleItems.length + 10),
      ]);
    }
  };
  const handlePorjectScroll = (event) => {
    const bottom =
      event.target.scrollHeight - event.target.scrollTop <=
      event.target.clientHeight + 10; // Adjust tolerance
    if (bottom && visibleProjectItems.length < projects.length) {
      setProjectVisibleItems((prevVisibleItems) => [
        ...prevVisibleItems,
        ...projects.slice(
          prevVisibleItems.length,
          prevVisibleItems.length + 10
        ),
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
    const { name, location, os, ipAddress, project, group } = registerData;

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
      { value: project, label: "Project" },
      { value: group, label: "Group" },
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
      project: [],
      group: [],
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

  const handleEditOpen = (host) => {
    setEditHostData({
      ...host,
      group: host.group.map((group) => group.id),
      project: host.project.map((project) => project.id),
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
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(`http://${baseUrl}/api/v1/hosts`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editHostData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add host.");
      }

      setSnackbar({
        open: true,
        message: "Host updated successfully!",
        severity: "success",
      });

      handleEditClose();
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

  const handleEditInputChange = (field, value) => {
    setEditHostData({ ...editHostData, [field]: value });
  };

  const handleDeleteOpen = (host) => {
    setSelectedHost(host);
    setOpenDelete(true);
  };

  const handleDeleteClose = async () => {
    setOpenDelete(false);
    setReason("");
  };

  const handleActionOpen = (device) => {
    setOpenActionView(true);
    setSelectedAction(device);
  };
  const handleActionClose = () => {
    setOpenActionView(false);
    setSelectedAction(null);
  };

  const handleActionForRequest = async () => {
    setApiLoading(true);
    try {
      const device_id = selectedAction?.id;
      const token = localStorage.getItem("authToken");
      const user_id = localStorage.getItem("user_id");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(
        `http://${baseUrl}/api/v1/request-device/${device_id}?user_id=${user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to submit request for device."
        );
      }

      setSnackbar({
        open: true,
        message: "Request for device submitted successfully!",
        severity: "success",
      });
      fetchHosts();
    } catch (error) {
      console.error("Error rejecting request for device:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred.",
        severity: "error",
      });
    } finally {
      setApiLoading(false);
      setOpenActionView(false);
    }
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
      const host_id = selectedHost.id;
      const token = localStorage.getItem("authToken");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(
        `http://${baseUrl}/api/v1/host/${host_id}/inactivate`,
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
        throw new Error(errorData.detail || "Failed to delete host.");
      }

      setSnackbar({
        open: true,
        message: "Host deleted successfully!",
        severity: "success",
      });
      fetchHosts();
    } catch (error) {
      console.error("Error rejecting host:", error);
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

  const filteredDevices = deviceList.filter((device) =>
    device.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CollapsibleRow = ({ host, index, isOpen, toggleOpen }) => {
    return (
      <>
        {/* Main Row */}
        <TableRow>
          <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={toggleOpen}
            >
              {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
            {index + 1}
          </TableCell>
          <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
            {host.name}
          </TableCell>
          <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
            {host.ipAddress}
          </TableCell>
          <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
            {host.location}
          </TableCell>
          <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
            {host.project.map((project) => project.name).join(", ")}
          </TableCell>
          <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
            {host.group.map((group) => group.name).join(", ")}
          </TableCell>
          <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
            {host.os}
          </TableCell>
          <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
            {host.devices.length}
          </TableCell>
          <TableCell sx={{ textAlign: "center", verticalAlign: "middle" }}>
            <IconButton color="primary" onClick={() => handleViewOpen(host)}>
              <VisibilityIcon />
            </IconButton>

            {userRole != "User" ? (
              <IconButton color="error">
                <DeleteIcon onClick={() => handleDeleteOpen(host)} />
              </IconButton>
            ) : null}
            {userRole != "User" ? (
              <IconButton color="secondary">
                <EditIcon onClick={() => handleEditOpen(host)} />
              </IconButton>
            ) : null}
          </TableCell>
        </TableRow>

        {/* Collapsible Details Row */}
        <TableRow>
          <TableCell colSpan={12} sx={{ paddingBottom: 0, paddingTop: 0 }}>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 2 }}>
                <Typography variant="h6">Devices Details</Typography>
                {host.devices && host.devices.length > 0 ? (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          Model
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          UDID
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          State
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          CPU
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          Manufacturer
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          OS Version
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          SDK Version
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          Security ID
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          Registered To
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          sx={{
                            borderRight: "1px solid black",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {host.devices.map((detail, idx) => (
                        <TableRow key={idx}>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            {detail.model}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            {detail.udid}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            {detail.state}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            {detail.cpu}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            {detail.manufacturer}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            {detail.os_version}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            {detail.sdk_version}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            {detail.security_id}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            {detail.registered_to.user_name}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                              color:
                                detail.status === "Registered" ? "green" : "red",
                            }}
                          >
                            {detail.status}
                          </TableCell>
                          <TableCell
                            sx={{
                              textAlign: "center",
                              verticalAlign: "middle",
                            }}
                          >
                            <IconButton
                              onClick={() => handleActionOpen(detail)}
                              disabled={
                                detail.status === "Registered" ||
                                detail.status != ""
                              }
                              sx={{
                                cursor:
                                  detail.status === "Registered"
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                            >
                              <AddCircleOutlineIcon
                                cursor={
                                  detail.status === "Registered"
                                    ? "not-allowed"
                                    : "pointer"
                                }
                              />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography variant="body2">
                    No devices details available.
                  </Typography>
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <Box>
      {/* Header */}

      {userRole != "User" ? (
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
      ) : (
        ""
      )}

      {/* Table */}
      <Box mt={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead
              sx={{
                backgroundImage:
                  "linear-gradient(to left, rgb(1,223,170), rgb(3,201,114), rgb(2,176,54))",
              }}
            >
              <TableRow>
                <TableCell
                  sx={{
                    color: "white",

                    borderRight: "2px solid white",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                />
                <TableCell
                  sx={{
                    color: "white",

                    borderRight: "2px solid white",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  SN. No
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",

                    borderRight: "2px solid white",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  Host Name
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",

                    borderRight: "2px solid white",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  IP Address
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",

                    borderRight: "2px solid white",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  Location
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",

                    borderRight: "2px solid white",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  Assigned Projects
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",

                    borderRight: "2px solid white",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  Assigned Groups
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",

                    borderRight: "2px solid white",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  OS
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",

                    borderRight: "2px solid white",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  No. of Devices
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {hosts.length > 0 ? (
                hosts.map((host, index) => (
                  <CollapsibleRow
                    key={host.id || `host-${index}`}
                    host={host}
                    index={index}
                    isOpen={collapsibleOpen[index] || false}
                    toggleOpen={() => toggleRow(index)}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No hosts found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Box
            sx={{
              width: "100%",
              height: "6px",
              backgroundImage:
                "linear-gradient(to left, rgb(1,223,170), rgb(3,201,114), rgb(2,176,54))",
              marginTop: "-2px",
            }}
          />
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
                "linear-gradient(to left, rgb(1,223,170), rgb(3,201,114), rgb(2,176,54))",
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
                <InputLabel>Projects *</InputLabel>
                <Select
                  multiple
                  value={registerData.project || []} // Bind multiple prject IDs
                  onChange={
                    (e) => handleRegisterInputChange("project", e.target.value) // Update multiple project
                  }
                  input={
                    <OutlinedInput
                      id="select-multiple-chip"
                      label="Projects *"
                    />
                  }
                  renderValue={(selected) =>
                    selected.map((id) => {
                      const project = projects.find(
                        (project) => project.id === id
                      );
                      return project ? (
                        <Box
                          key={project.id}
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
                          {project.name}
                        </Box>
                      ) : (
                        "Select Projects"
                      );
                    })
                  }
                  MenuProps={{
                    PaperProps: {
                      onScroll: handlePorjectScroll,
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
                <InputLabel>Groups *</InputLabel>
                <Select
                  multiple
                  value={registerData.group || []} // Bind multiple group IDs
                  onChange={
                    (e) => handleRegisterInputChange("group", e.target.value) // Update multiple groups
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
                      onScroll: handleGroupScroll,
                      style: { maxHeight: 150, overflowY: "auto" },
                    },
                  }}
                  disabled={loadingGroups} // Disable dropdown while loading
                >
                  {loadingGroups ? (
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

      {/* View Host Details Modal */}
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
              👤 Host Details
            </Typography>
            <IconButton onClick={handleViewClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Host Details Content */}
          {selectedHost && (
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
                  Name:{" "}
                  <span style={{ color: "orange" }}>{selectedHost.name}</span>
                </Typography>
                <Typography fontWeight="bold">
                  IP Address:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedHost.ipAddress}
                  </span>
                </Typography>
                <Typography fontWeight="bold">
                  Location:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedHost.location}
                  </span>
                </Typography>
                <Typography fontWeight="bold">
                  OS: <span style={{ color: "orange" }}>{selectedHost.os}</span>
                </Typography>
                <Typography fontWeight="bold">
                  Projects:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedHost.project.map((pro) => pro.name).join(", ")}
                  </span>
                </Typography>
                <Typography fontWeight="bold">
                  Groups:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedHost.group.map((grp) => grp.name).join(", ")}
                  </span>
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Edit Host Modal */}
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
                "linear-gradient(to left, rgb(1,223,170), rgb(3,201,114), rgb(2,176,54))",
              color: "white",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              👤 Edit Host
            </Typography>
            <IconButton onClick={handleEditClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form */}
          <Box sx={{ p: 3 }}>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Name *"
                value={editHostData.name}
                onChange={(e) => handleEditInputChange("name", e.target.value)}
              />
              <TextField
                label="IP Address *"
                value={editHostData.ipAddress}
                onChange={(e) =>
                  handleEditInputChange("ipAddress", e.target.value)
                }
              />
              <TextField
                label="Location *"
                value={editHostData.location}
                onChange={(e) =>
                  handleEditInputChange("location", e.target.value)
                }
              />
              <TextField
                label="OS *"
                value={editHostData.os}
                onChange={(e) => handleEditInputChange("os", e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Groups *</InputLabel>
                <Select
                  multiple
                  value={editHostData.group || []} // Bind multiple group IDs
                  onChange={
                    (e) => handleEditInputChange("group", e.target.value) // Update multiple groups
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
                      onScroll: handleGroupScroll,
                      style: { maxHeight: 150, overflowY: "auto" },
                    },
                  }}
                  disabled={loadingGroups} // Disable dropdown while loading
                >
                  {loadingGroups ? (
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

              <FormControl fullWidth>
                <InputLabel>Projects *</InputLabel>
                <Select
                  multiple
                  value={editHostData.project || []} // Bind multiple project IDs
                  onChange={
                    (e) => handleEditInputChange("project", e.target.value) // Update multiple project
                  }
                  input={
                    <OutlinedInput
                      id="select-multiple-chip"
                      label="Projects *"
                    />
                  }
                  renderValue={(selected) =>
                    selected.map((id) => {
                      const project = projects.find(
                        (project) => project.id === id
                      );

                      return project ? (
                        <Box
                          key={project.id}
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
                          {project.name}
                        </Box>
                      ) : (
                        "Select Projects"
                      );
                    })
                  }
                  MenuProps={{
                    PaperProps: {
                      onScroll: handlePorjectScroll,
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
            </Box>
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
        </Box>
      </Modal>

      {/* Delete Host Modal */}
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
                "linear-gradient(to left, rgb(1,223,170), rgb(3,201,114), rgb(2,176,54))",
              color: "white",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight="bold" variant="h6">
              👤 Delete Host
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

      {/* Device Request Model */}
      <Dialog
        open={openActionView}
        onClose={handleActionClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Action Creation</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Device ID: {selectedAction?.model ? selectedAction.model : "N/A"}
          </Typography>
          <Typography>Are you sure want to access to device ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleActionForRequest}
            variant="contained"
            color="primary"
          >
            Submit
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
