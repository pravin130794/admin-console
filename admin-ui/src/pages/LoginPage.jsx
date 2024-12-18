import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import { useNavigate } from "react-router-dom";
import SnackbarComponent from "../components/Snackbar";

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // Can be 'success', 'error', 'warning', 'info'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // Simulate API call
      // const response = await fetch("https://api.example.com/login", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) {
      //   throw new Error("Invalid username or password");
      // }

      // const result = await response.json();

      console.log("🚀 ~ handleSubmit ~ formData:", formData);
      // Success: Redirect to dashboard
      setSnackbar({
        open: true,
        message: "Login successful!",
        severity: "success",
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      // Error: Show Snackbar
      setSnackbar({
        open: true,
        message: error.message || "An error occurred. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        backgroundImage: "url('https://source.unsplash.com/random/1920x1080')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      ></Box>

      {/* Login Card */}
      <Paper
        sx={{
          position: "relative",
          zIndex: 2,
          padding: "40px",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#001a99",
            color: "white",
            padding: "10px",
            borderRadius: "50%",
            display: "inline-flex",
            marginBottom: "10px",
          }}
        >
          <AccountCircleIcon fontSize="large" />
        </Box>

        <Typography variant="h5" fontWeight="bold" mb={2}>
          Login
        </Typography>

        {/* Username Field */}
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          sx={{ marginBottom: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Password Field */}
        <TextField
          variant="outlined"
          fullWidth
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          sx={{ marginBottom: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Login Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{
            backgroundColor: "#001a99",
            color: "white",
            fontWeight: "bold",
            "&:hover": { backgroundColor: "#0026d1" },
          }}
        >
          Login
        </Button>

        {/* Register Link */}
        <Typography mt={2} variant="body2" color="gray">
          Don’t have an account?{" "}
          <span style={{ color: "#001a99", cursor: "pointer" }}>
            Register User
          </span>
        </Typography>
      </Paper>

      {/* Reusable Snackbar Component */}
      <SnackbarComponent
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default LoginPage;
