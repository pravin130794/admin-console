import React from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";

// Sample User Data
const users = [
  { id: 1, username: "Tester", email: "Testing@gmail.com", status: "Rejected" },
  { id: 2, username: "Tester", email: "Testing@gmail.com", status: "Approved" },
  { id: 3, username: "Tester", email: "Testing@gmail.com", status: "Rejected" },
  { id: 4, username: "Tester", email: "Testing@gmail.com", status: "Rejected" },
  { id: 5, username: "Tester", email: "Testing@gmail.com", status: "Approved" },
  { id: 6, username: "Tester", email: "Testing@gmail.com", status: "Rejected" },
  { id: 7, username: "Tester", email: "Testing@gmail.com", status: "Rejected" },
  { id: 8, username: "Tester", email: "Testing@gmail.com", status: "Rejected" },
];

const UserPage = () => {
  return (
    <Box sx={{ p: 3, backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Header Section */}
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
            size="small"
            sx={{ backgroundColor: "#0044cc", marginRight: "10px" }}
          >
            + Add User
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{ backgroundColor: "#0044cc" }}
          >
            + Add Group
          </Button>
        </Box>
      </Box>

      {/* Table Section */}
      <Box mt={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#001a99" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  S.No
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
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow
                  key={user.id}
                  sx={{ backgroundColor: index % 2 === 0 ? "#f5f5ff" : "white" }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.status === "Approved" ? (
                      <Box sx={{ color: "green", display: "flex", alignItems: "center" }}>
                        <CheckCircleIcon sx={{ marginRight: "5px" }} />
                        Approved
                      </Box>
                    ) : (
                      <Box sx={{ color: "red", display: "flex", alignItems: "center" }}>
                        <CancelIcon sx={{ marginRight: "5px" }} />
                        Rejected
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton color="warning">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton color="warning">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="warning">
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton color="warning">
                      <CancelIcon />
                    </IconButton>
                    <IconButton color="warning">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="warning">
                      <LockIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default UserPage;
