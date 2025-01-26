import React, { useState, useRef, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SapphireLogo from "../assets/SapphireLogo.png";
import logo from "../assets/logo.png";
import backgroundImage from "../assets/background.png";
import appleDevice from "../assets/android.png";
import androidDevice from "../assets/android.png";
import testAutomationImage from "../assets/testAutomation.png";
import appiumLogo from "../assets/appiumSelenium.png";
import seleniumLogo from "../assets/appiumSelenium.png";
import devicesBanner from "../assets/devices.png";
import features from "../assets/features.png";
import cloud from "../assets/cloud.png";
import execution from "../assets/execution.png";
import scalable from "../assets/scalable.png";
import automation from "../assets/automation.png";
import standalone from "../assets/standalone.png";
import plugandplay from "../assets/plug-and-play.png";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import "../App.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Home");
  const [showScroll, setShowScroll] = useState(false);

  const devices = [
    { name: "Mobile", image: "./src/assets/mobile.png" },
    { name: "Tablet", image: "./src/assets/tablet.png" },
    { name: "Smart Watch", image: "./src/assets/smartwatch.png" },
    { name: "Laptop/Desktop", image: "./src/assets/laptop-desktop.png" },
  ];

  // References for each section
  const remoteAccessRef = useRef(null);
  const testAutomationRef = useRef(null);
  const multipleDevicesRef = useRef(null);
  const featuresRef = useRef(null);

  // Function to handle scroll
  const handleScroll = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const checkScrollTop = () => {
    if (!showScroll && window.scrollY > 300) {
      setShowScroll(true);
    } else if (showScroll && window.scrollY <= 300) {
      setShowScroll(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, [showScroll]);

  return (
    <Box>
      {/* Top Navbar */}
      <AppBar position="static" sx={{ backgroundColor: "black" }}>
        <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
          <div className="box a" onClick={() => navigate("/login")}>
            Login
          </div>
          <div className="box a" onClick={() => navigate("/signup")}>
            Sign up
          </div>
        </Toolbar>
      </AppBar>

      {/* Header Section */}
      <Box sx={{ borderBottom: "1px solid #ccc" }}>
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              paddingY: 1,
            }}
          >
            <img src={logo} alt="Verizon Logo" height="80" />
            <Box sx={{ display: "flex", gap: 4 }}>
              {[
                { label: "Home", ref: null },
                { label: "Remote Devices", ref: remoteAccessRef },
                { label: "Test Automation", ref: testAutomationRef },
                { label: "Multiple devices", ref: multipleDevicesRef },
                { label: "Features", ref: featuresRef },
              ].map((menu) => (
                <Typography
                  key={menu.label}
                  variant="h6"
                  sx={{
                    cursor: "pointer",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -5, // Position the underline
                      left: 0,
                      right: 0,
                      height: "3px", // Height of the underline
                      background:
                        activeSection === menu.label
                          ? "linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)"
                          : "transparent", // Show underline only for active item
                      borderRadius: "2px",
                      transition: "all 0.3s ease", // Smooth transition for underline
                    },
                  }}
                  onClick={() => {
                    setActiveSection(menu.label);
                    handleScroll(menu.ref);
                  }}
                >
                  {menu.label}
                </Typography>
              ))}
            </Box>
            <img src={SapphireLogo} alt="Sapphire Logo" height="30" />
          </Toolbar>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "500px",
          position: "relative",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "center",
            marginLeft: "6%",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "white",
              textShadow: "2px 2px 5px rgba(0, 0, 0, 0.8)",
              lineHeight: 1.2,
            }}
          >
            REMOTE DEVICE <br />
            MANAGEMENT <br />
            SYSTEM
          </Typography>
        </Container>
      </Box>

      <Box sx={{ height: "90px", backgroundColor: "#f9f9f9" }} />

      {/* Remote Access Section */}
      <Box
        ref={remoteAccessRef}
        sx={{ padding: "50px 20px", backgroundColor: "#f9f9f9" }}
      >
        {/* Gradient Header */}
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: "bold",
            marginBottom: "50px",
            background: "linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          PROVIDE REMOTE ACCESS TO MOBILE DEVICES
          <Box
            sx={{
              height: "4px",
              background:
                "linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)",
              width: "100%",
              borderRadius: "2px",
            }}
          />
        </Typography>

        {/* Apple Section */}
        <Grid
          container
          spacing={4}
          alignItems="center"
          sx={{ marginBottom: "50px" }}
        >
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                padding: "10px",
              }}
            >
              <img
                src={appleDevice}
                alt="Apple device remote access"
                style={{ width: "100%", height: "auto" }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <img
                  src={appleDevice}
                  alt="Apple logo"
                  style={{ width: "40px", height: "40px", marginRight: "10px" }}
                />
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Apple
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ marginBottom: "20px" }}>
                Enable access over the internet, intranet, or a closed user
                group to various devices like phones, tablets, smartwatches, and
                IoT devices with screens.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "30px",
                  padding: "6px 20px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderColor: "rgba(0, 0, 0, 0.5)",
                  color: "rgba(0, 0, 0, 0.8)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    borderColor: "rgba(0, 0, 0, 0.8)",
                  },
                }}
              >
                Quick Start Guid
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                    marginLeft: "10px",
                    borderRadius: "50%",
                    border: "1px solid rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <ArrowForwardIcon fontSize="small" />
                </Box>
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Android Section */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Android
                  <img
                    src={appleDevice}
                    alt="Android logo"
                    style={{
                      width: "32px",
                      height: "32px",
                      marginLeft: "10px",
                    }}
                  />
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ marginBottom: "20px" }}>
                Allow users to view screens, perform touch gestures, swipe, and
                fully interact with the devices remotely.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "30px",
                  padding: "6px 20px",
                  textTransform: "none",
                  fontSize: "16px",
                  borderColor: "rgba(0, 0, 0, 0.5)",
                  color: "rgba(0, 0, 0, 0.8)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    borderColor: "rgba(0, 0, 0, 0.8)",
                  },
                }}
              >
                Quick Start Guid
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                    marginLeft: "10px",
                    borderRadius: "50%",
                    border: "1px solid rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <ArrowForwardIcon fontSize="small" />
                </Box>
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
            <Box
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                padding: "10px",
              }}
            >
              <img
                src={androidDevice}
                alt="Android devices with blue lighting"
                style={{ width: "100%", height: "auto" }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Test Automation Section */}
      <Box
        ref={testAutomationRef}
        sx={{ padding: "50px 20px", backgroundColor: "#f9f9f9" }}
      >
        {/* Test Automation Section */}
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: "bold",
            marginBottom: "50px",
            background: "linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          TEST AUTOMATION
          <Box
            sx={{
              height: "4px",
              background:
                "linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)",
              width: "100%",
              borderRadius: "2px",
            }}
          />
        </Typography>

        <Box
          sx={{
            backgroundImage: `url(${testAutomationImage})`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            height: "500px",
            position: "relative",
          }}
        >
          <Container
            maxWidth="md"
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              textAlign: "center",
              marginRight: "6%",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                color: "white",
                textShadow: "2px 2px 5px rgba(0, 0, 0, 0.8)",
                lineHeight: 1.2,
              }}
            >
              TEST <br />
              AUTOMATION <br />
            </Typography>
          </Container>
        </Box>

        <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 4,
              flexWrap: "wrap",
            }}
          >
            {/* Left Side Text */}
            <Typography
              sx={{
                flex: "1",
                minWidth: "300px",
                color: "#666",
                fontSize: "16px",
              }}
            >
              Seamlessly integrate with existing automation platforms like
              Appium and Selenium. Leverage and reuse previously developed
              scripts to maximize efficiency and reduce redundancy.
            </Typography>

            {/* Right Side Logos */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 6,
                flex: "1",
                minWidth: "300px",
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center">
                <img
                  src={appiumLogo}
                  alt="Appium"
                  style={{ width: "40px", height: "40px", marginBottom: "8px" }}
                />
                <Typography sx={{ fontWeight: "bold" }}>Appium</Typography>
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center">
                <img
                  src={seleniumLogo}
                  alt="Selenium"
                  style={{ width: "40px", height: "40px", marginBottom: "8px" }}
                />
                <Typography sx={{ fontWeight: "bold" }}>Selenium</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Support multiple devices Section */}
      <Box
        ref={multipleDevicesRef}
        sx={{ backgroundColor: "#f9f9f9", padding: "50px 20px" }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: "bold",
            marginBottom: 4,
            background: "linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Support <span style={{ color: "#3b82f6" }}>Multiple devices</span>
          <Box
            sx={{
              height: "4px",
              background:
                "linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)",
              width: "100%",
              borderRadius: "2px",
            }}
          />
        </Typography>

        {/* Banner */}
        <Box
          sx={{
            backgroundImage: `url(${devicesBanner})`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            height: "500px",
            position: "relative",
          }}
        >
          <Container
            maxWidth="md"
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              textAlign: "center",
              marginLeft: "6%",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                color: "white",
                textShadow: "2px 2px 5px rgba(0, 0, 0, 0.8)",
                lineHeight: 1.2,
              }}
            >
              SUPPORT <br /> MULTIPLE DEVICES
            </Typography>
          </Container>
        </Box>

        {/* Devices Cards */}
        <Container>
          <Grid
            container
            spacing={3}
            justifyContent="center"
            sx={{
              position: "relative",
              top: "-125px", // Adjust to overlap the banner
              maxWidth: "90%", // Center the cards and give space on left and right
              margin: "0 auto", // Center horizontally
            }}
          >
            {devices.map((device, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    textAlign: "center",
                    padding: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.7)", // Adjust transparency here
                    backdropFilter: "blur(10px)", // Add blur effect for a frosted glass look
                  }}
                >
                  <CardMedia
                    component="img"
                    alt={device.name}
                    image={device.image}
                    sx={{
                      width: "100%",
                      height: "120px",
                      objectFit: "contain",
                      marginBottom: 2,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {device.name}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Feature Section */}
      <Box
        ref={featuresRef}
        sx={{ padding: "50px 20px", backgroundColor: "#f9f9f9" }}
      >
        {/* Gradient Header */}
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: "bold",
            marginBottom: "50px",
            background: "linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          FEATURES
          <Box
            sx={{
              height: "4px",
              background:
                "linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)",
              width: "100%",
              borderRadius: "2px",
            }}
          />
        </Typography>
        <Box
          sx={{
            backgroundImage: `url(${features})`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            height: "500px",
            position: "relative",
          }}
        ></Box>

        <Box sx={{ padding: "50px 20px", backgroundColor: "#f9f9f9" }}>
          <Container maxWidth="lg">
            <Grid
              container
              spacing={6}
              sx={{ marginBottom: "50px" }}
              alignItems="center"
            >
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    border: "2px solid #3b82f6",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={scalable}
                    alt="Scalable"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  Scalable
                </Typography>
                <Box
                  sx={{
                    borderBottom: "2px solid #3b82f6",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                />
                <Typography sx={{ color: "#666", lineHeight: 1.6 }}>
                  A paragraph could contain a series of brief examples or a
                  single long illustration of a general point. It might describe
                  a place, character, or process; narrate a series of events;
                  compare or contrast two or more things; classify items into
                  categories; or describe causes and effects.
                </Typography>
              </Grid>
            </Grid>

            <Grid
              container
              spacing={6}
              sx={{ marginBottom: "50px" }}
              alignItems="center"
            >
              <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  Automation
                </Typography>
                <Box
                  sx={{
                    borderBottom: "2px solid #3b82f6",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                />
                <Typography sx={{ color: "#666", lineHeight: 1.6 }}>
                  A paragraph could contain a series of brief examples or a
                  single long illustration of a general point. It might describe
                  a place, character, or process; narrate a series of events;
                  compare or contrast two or more things; classify items into
                  categories; or describe causes and effects.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
                <Box
                  sx={{
                    border: "2px solid #3b82f6",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={automation}
                    alt="Automation"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
        <Box sx={{ padding: "50px 20px", backgroundColor: "#f9f9f9" }}>
          <Container maxWidth="lg">
            <Grid
              container
              spacing={6}
              sx={{ marginBottom: "10%" }}
              alignItems="center"
            >
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    border: "2px solid #3b82f6",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={cloud}
                    alt="Scalable"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  Cloud
                </Typography>
                <Box
                  sx={{
                    borderBottom: "2px solid #3b82f6",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                />
                <Typography sx={{ color: "#666", lineHeight: 1.6 }}>
                  A paragraph could contain a series of brief examples or a
                  single long illustration of a general point. It might describe
                  a place, character, or process; narrate a series of events;
                  compare or contrast two or more things; classify items into
                  categories; or describe causes and effects.
                </Typography>
              </Grid>
            </Grid>

            <Grid
              container
              spacing={6}
              sx={{ marginBottom: "10%" }}
              alignItems="center"
            >
              <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  Standalone
                </Typography>
                <Box
                  sx={{
                    borderBottom: "2px solid #3b82f6",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                />
                <Typography sx={{ color: "#666", lineHeight: 1.6 }}>
                  A paragraph could contain a series of brief examples or a
                  single long illustration of a general point. It might describe
                  a place, character, or process; narrate a series of events;
                  compare or contrast two or more things; classify items into
                  categories; or describe causes and effects.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
                <Box
                  sx={{
                    border: "2px solid #3b82f6",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={standalone}
                    alt="Standalone"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
        <Box sx={{ padding: "50px 20px", backgroundColor: "#f9f9f9" }}>
          <Container maxWidth="lg">
            <Grid
              container
              spacing={6}
              sx={{ marginBottom: "10%" }}
              alignItems="center"
            >
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    border: "2px solid #3b82f6",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={plugandplay}
                    alt="Device Plug & Play"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  Device Plug & Play
                </Typography>
                <Box
                  sx={{
                    borderBottom: "2px solid #3b82f6",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                />
                <Typography sx={{ color: "#666", lineHeight: 1.6 }}>
                  A paragraph could contain a series of brief examples or a
                  single long illustration of a general point. It might describe
                  a place, character, or process; narrate a series of events;
                  compare or contrast two or more things; classify items into
                  categories; or describe causes and effects.
                </Typography>
              </Grid>
            </Grid>

            <Grid
              container
              spacing={6}
              sx={{ marginBottom: "50px" }}
              alignItems="center"
            >
              <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", marginBottom: "10px" }}
                >
                  Parallel Execution
                </Typography>
                <Box
                  sx={{
                    borderBottom: "2px solid #3b82f6",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                />
                <Typography sx={{ color: "#666", lineHeight: 1.6 }}>
                  A paragraph could contain a series of brief examples or a
                  single long illustration of a general point. It might describe
                  a place, character, or process; narrate a series of events;
                  compare or contrast two or more things; classify items into
                  categories; or describe causes and effects.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
                <Box
                  sx={{
                    border: "2px solid #3b82f6",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={execution}
                    alt="Execution"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
      {/* Footer Section */}

      <Box
        sx={{
          height: "4px",
          background: "linear-gradient(to right, #1e3a8a, #3b82f6, #06b6d4)",
          width: "100%",
          borderRadius: "2px",
        }}
      />
      <Box
        sx={{
          backgroundColor: "#1a1a1a", // Dark background color
          color: "white",
          padding: "10px", // Reduced padding
          textAlign: "center",
          borderTop: "4px solid",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1, // Reduced gap between links
              flexWrap: "wrap",
              padding: "5%",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                marginBottom: "5px", // Reduced margin
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              Copyright © 2025 Verizon
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1, // Reduced gap between links
              flexWrap: "wrap",
              padding: "5%",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Privacy Policy
            </Typography>
            <Typography>|</Typography>
            <Typography
              variant="body2"
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Term of Use
            </Typography>
            <Typography>|</Typography>
            <Typography
              variant="body2"
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sales Policy
            </Typography>
            <Typography>|</Typography>
            <Typography
              variant="body2"
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Legal
            </Typography>
            <Typography>|</Typography>
            <Typography
              variant="body2"
              sx={{
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Site Map
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          display: showScroll ? "flex" : "none",
          backgroundColor: "#000",
          color: "#fff",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
        }}
        onClick={scrollToTop}
      >
        <KeyboardArrowUpIcon fontSize="large" />
      </div>
    </Box>
  );
};

export default HomePage;
