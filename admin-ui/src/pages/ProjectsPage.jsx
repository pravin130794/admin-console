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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CircularProgress from "@mui/material/CircularProgress";
import SnackbarComponent from "../components/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ApiBaseUrl from "../ApiBaseUrl";

const ProjectsPage = () => {
  const [projects, setProjets] = useState([]);
  const [page, setPage] = useState(0);
  const [openView, setOpenView] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDelete, setOpenDelete] = useState(false);
  const [reason, setReason] = useState("");
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [openRegister, setOpenRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: "",
    description: "",
    createdBy: "",
    projectAdmin: "",
    assignedUsers: [],
  });
  const [apiLoading, setApiLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const paginatedProjects = projects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    if (openRegister || openEdit) {
      fetchGroups();
    }
  }, [openRegister, openEdit]);

  useEffect(() => {
    fetchProjects();
  }, [page, rowsPerPage]);

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

  const fetchProjects = async () => {
    setApiLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const user_id = localStorage.getItem("user_id");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(
        `http://${baseUrl}/api/v1/projects?user_id=${user_id}&skip=${page}&limit=${rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ); // Replace with your API
      const data = await response.json();
      setProjets(data.projects); // Assuming API returns an array of project
      setTotalProjects(data.total || 0);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setApiLoading(false);
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

  const handleViewOpen = (project) => {
    setSelectedProject(project);
    setOpenView(true);
  };

  const handleViewClose = () => {
    setOpenView(false);
    setSelectedProject(null);
  };

  const handleDeleteOpen = (project) => {
    setSelectedProject(project);
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
      const project_id = selectedProject.id;
      const token = localStorage.getItem("authToken");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(
        `http://${baseUrl}/api/v1/project/${project_id}/inactivate`,
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
        throw new Error(errorData.detail || "Failed to delete project.");
      }

      setSnackbar({
        open: true,
        message: "Project deleted successfully!",
        severity: "success",
      });
      fetchProjects();
    } catch (error) {
      console.error("Error rejecting project:", error);
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

  const handleEditOpen = (project) => {
    setSelectedProject(project);
    setEditedData({
      ...project,
      assignedUsers: project.assignedUsers.map((user) => user.id),
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
      const response = await fetch(`http://${baseUrl}/api/v1/projects`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update project.");
      }

      setSnackbar({
        open: true,
        message: "Project updated successfully!",
        severity: "success",
      });

      handleEditClose();
      fetchProjects();
    } catch (error) {
      console.error("Error update project:", error);
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

  const validateRegisterForm = () => {
    const { name, description } = registerData;

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
      { value: name, label: "Project Name" },
      { value: description, label: "Project Description" },
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
      description: "",
      assignedUsers: [],
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
      registerData.createdBy = localStorage.getItem("user_id");
      registerData.projectAdmin = localStorage.getItem("user_id");
      registerData.assignedUsers.push(localStorage.getItem("user_id"));
      const token = localStorage.getItem("authToken");
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const response = await fetch(`http://${baseUrl}/api/v1/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add project.");
      }

      setSnackbar({
        open: true,
        message: "Project added successfully!",
        severity: "success",
      });

      handleRegisterClose();
      fetchProjects();
    } catch (error) {
      console.error("Error adding project:", error);
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
            Project Management
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            onClick={handleRegisterOpen}
            sx={{ backgroundColor: "#ffffff", marginRight: "10px" }}
          >
            <Typography variant="h8" fontWeight="bold" color="#001a99">
              + Add Project
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
                  Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Description
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Assign Groups
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Assign Users
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <TableRow key={project.id || `project-${index}`}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.description}</TableCell>
                    <TableCell>{project.groupName}</TableCell>
                    <TableCell>
                      {project.assignedUsers.length > 0 ? (
                        <Typography>
                          {project.assignedUsers
                            .map((user) => user.username)
                            .join(", ")}
                        </Typography>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{project.status}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewOpen(project)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteOpen(project)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handleEditOpen(project)}
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
                      No projects found.
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
                "linear-gradient(to left,rgb(1,223,170),rgb(3,201,114),rgb(2,176,54))",
              marginTop: "-2px",
            }}
          />
        </TableContainer>
      </Box>
      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalProjects}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />

      {/* View project Details Modal */}
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
              👤 Project Details
            </Typography>
            <IconButton onClick={handleViewClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Project Details Content */}
          {selectedProject && (
            <Box sx={{ padding: "20px" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px 20px",
                  marginBottom: "10px",
                }}
              >
                <Typography fontWeight="bold">
                  Project Name:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedProject.name}
                  </span>
                </Typography>
                <Typography fontWeight="bold">
                  Description:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedProject.description}
                  </span>
                </Typography>
                <Typography fontWeight="bold">
                  Description:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedProject.status}
                  </span>
                </Typography>
                <Typography fontWeight="bold">
                  Group:{" "}
                  <span style={{ color: "orange" }}>
                    {selectedProject.groupName}
                  </span>
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Delete Project Modal */}
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
              👤 Delete Project
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

      {/* Edit Project Details*/}
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
              📝 Edit Project
            </Typography>
            <IconButton onClick={handleEditClose} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Form */}
          {selectedProject && (
            <Box sx={{ p: 3 }}>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="Name *"
                  value={editedData.name || ""}
                  disabled
                />
                <TextField
                  label="Description *"
                  value={editedData.description || ""}
                  onChange={(e) =>
                    handleUpdateInputChange("description", e.target.value)
                  }
                />

                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Status</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Status *"
                    value={editedData.status || ""}
                    onChange={(e) =>
                      handleUpdateInputChange("status", e.target.value)
                    }
                  >
                    <MenuItem value="Started">Started</MenuItem>
                    <MenuItem value="Not Started">Not started</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Groups *</InputLabel>
                  <Select
                    value={
                      visibleItems.some(
                        (group) => group.id === editedData.groupId
                      )
                        ? editedData.groupId
                        : "" // Use an empty string if the value is not in the list
                    }
                    onChange={(e) =>
                      handleUpdateInputChange("groupId", e.target.value)
                    }
                    input={
                      <OutlinedInput id="select-single" label="Groups *" />
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
          )}
        </Box>
      </Modal>

      {/* Register Project Modal */}
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
              👤 Register Project
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
                label="Description *"
                value={registerData.description}
                onChange={(e) =>
                  handleRegisterInputChange("description", e.target.value)
                }
              />
              <FormControl fullWidth>
                <InputLabel>Groups *</InputLabel>
                <Select
                  value={registerData.groupId || ""} // Bind single group ID
                  onChange={(e) =>
                    handleRegisterInputChange("groupId", e.target.value)
                  } // Update single group
                  input={<OutlinedInput id="select-single" label="Groups *" />}
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

export default ProjectsPage;
