import axios from "axios";
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
import { useAuth } from "../context/Auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields.",
        severity: "warning",
      });
      return;
    }
    setLoading(true);
    try {
      // Make API call to the login endpoint
      const response = await fetch("http://localhost:8000/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.detail,
          severity: "error",
        });
        // throw new Error(errorData || "Login failed");
      }
      // Assuming the API returns a token upon successful login
      const { access_token, user_id } = await response.json();

      // Store the token in local storage or cookies
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("user_id", user_id);

      // Show success message
      setSnackbar({
        open: true,
        message: "Login successful!",
        severity: "success",
      });
      setTimeout(() => {
        login(formData.username);
        navigate("/");
      }, 1000);
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleNavigateToSignup = () => {
    navigate("/signup");
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
        {/* Centered Logo */}
        <Box
          sx={{
            position: "absolute",
            top: "-50px", // Moves half-outside
            left: "50%",
            transform: "translate(-50%, 0)",
            backgroundColor: "#001a99",
            color: "white",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          <AccountCircleIcon fontSize="small" sx={{ fontSize: "50px" }} />
        </Box>

        <Box mt={3}>
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
            disabled={loading}
            sx={{
              backgroundColor: "#001a99",
              color: "white",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#0026d1" },
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {/* Register Link */}
          <Typography mt={2} variant="body2" color="gray">
            Don’t have an account?{" "}
            <span
              style={{ color: "#001a99", cursor: "pointer" }}
              onClick={handleNavigateToSignup}
            >
              Register User
            </span>
          </Typography>
        </Box>
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
