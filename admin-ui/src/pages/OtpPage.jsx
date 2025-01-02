import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert,
  Input,
  TextField,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

const OTPPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [apiLoading, setApiLoading] = useState(false);
  // State for OTP fields, password fields, and Snackbar
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6-digit OTP
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [isLoading, setIsLoading] = useState(false); // Loader state

  // Handle OTP Input Change
  const handleOtpChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus the next input if value is entered
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  // Handle Backspace Navigation
  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  // Handle Password Input Change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Submission
  const handleSubmit = async () => {
    const otpValue = otp.join("");
    const { password, confirmPassword } = formData;

    // Check if OTP is complete
    if (otpValue.length !== 6) {
      setSnackbar({
        open: true,
        message: "Please enter the complete OTP!",
        severity: "error",
      });
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setSnackbar({
        open: true,
        message: "Passwords do not match!",
        severity: "error",
      });
      return;
    }

    const requestBody = {
      otp: otpValue,
      password,
    };

    setIsLoading(true); // Show loader during API call
    setApiLoading(true);
    try {
      requestBody.email = email;
      const response = await fetch("http://localhost:8001/api/v1/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to verify OTP");
      }

      const data = await response.json();
      setSnackbar({
        open: true,
        message: data.message || "OTP Verified and Password Set Successfully!",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/login"); // Navigate to login page
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "An error occurred during OTP verification.",
        severity: "error",
      });
    } finally {
      setApiLoading(false);
      setIsLoading(false); // Hide loader
    }
  };

  // Handle Snackbar Close
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

      {/* OTP and Password Card */}
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
        <Box mt={3}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Enter OTP
          </Typography>

          <Typography variant="body2" color="gray" mb={3}>
            We’ve sent an OTP to your registered email. Please enter it below
            and set your new password.
          </Typography>

          {/* OTP Input Fields */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mb: 3,
            }}
          >
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-input-${index}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    fontSize: "20px",
                    width: "40px",
                    height: "40px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  },
                }}
              />
            ))}
          </Box>

          {/* Password Fields */}
          <TextField
            variant="outlined"
            fullWidth
            type="password"
            label="New Password"
            name="password"
            value={formData.password}
            onChange={handlePasswordChange}
            sx={{ marginBottom: 2 }}
          />

          <TextField
            variant="outlined"
            fullWidth
            type="password"
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handlePasswordChange}
            sx={{ marginBottom: 3 }}
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={isLoading} // Disable button during API call
            sx={{
              backgroundColor: "#001a99",
              color: "white",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "#0026d1" },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Verify OTP and Set Password"
            )}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar for Alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Backdrop Loader */}
      <Backdrop open={apiLoading} sx={{ color: "#fff", zIndex: 1301 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default OTPPage;
