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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CircularProgress from "@mui/material/CircularProgress";
import SnackbarComponent from "../components/Snackbar";

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  console.log("groups---->", groups);

  const paginatedGroups = groups.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    fetchGroups();
  }, []);

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

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const user_id = localStorage.getItem("user_id");
      const response = await fetch(
        `http://localhost:8000/api/v1/groups?user_id=${user_id}`
      ); // Replace with your API
      const data = await response.json();
      console.log(data.groups);

      setGroups(data.groups); // Assuming API returns an array of groups
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundImage:
            "linear-gradient(to left, #5A8DFF, #001a99, #000080)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
        }}
      >
        <Box sx={{ flex: 1, textAlign: "center" }}>
          <Typography variant="h5" fontWeight="bold">
            Group Management
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#ffffff", marginRight: "10px" }}
          >
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
                  Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Description
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedGroups.length > 0 ? (
                paginatedGroups.map((group, index) => (
                  <TableRow key={group.id || `group-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>{group.description}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleViewOpen(group)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" color="textSecondary">
                      No groups found.
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
        count={groups.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
      />

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

export default GroupsPage;
