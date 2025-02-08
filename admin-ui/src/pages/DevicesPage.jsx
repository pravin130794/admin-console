import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Backdrop,
  CircularProgress,
  Grid,
  Button,
} from "@mui/material";
import {
  initializeWebSocket,
  closeWebSocket,
} from "../services/WebSocketService";
import ApiBaseUrl from "../ApiBaseUrl";
import {
  selectedDeviceAccordion,
  selectedDeviceUrl,
  selectedDeviceModelName,
  selectedDeviceModelBody,
} from "../services/recoilState";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SnackbarComponent from "../components/Snackbar";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import MemoryIcon from "@mui/icons-material/Memory";
import BatteryCharging90Icon from "@mui/icons-material/BatteryCharging90";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import SdCardIcon from "@mui/icons-material/SdCard";

const DevicesPage = () => {
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useRecoilState(selectedDeviceUrl);
  const [apiLoading, setApiLoading] = useState(false);
  const [selectedDeviceBody, setSelectedDeviceBody] = useRecoilState(
    selectedDeviceModelBody
  );
  const [selectedDeviceName, setSelectedDeviceName] = useRecoilState(
    selectedDeviceModelName
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(true);
  // const [expandedDevice, setExpandedDevice] = useState(null);
  const [expandedDevice, setExpandedDevice] = useRecoilState(
    selectedDeviceAccordion
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // Can be 'success', 'error', 'warning', 'info'
  });
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleAccordionToggle = (deviceUdid) => {
    setExpandedDevice(expandedDevice === deviceUdid ? null : deviceUdid);
  };
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };
  useEffect(() => {
    const handleWebSocketMessage = (data) => {
      console.log("Received WebSocket update:", data);

      if (data) {
        setDeviceList((prevList) => {
          let updatedList = [...prevList];

          if (data.operationType === "delete") {
            // Handle delete operation
            updatedList = updatedList.filter(
              (device) => device.fullDocument?._id !== data.documentKey._id
            );

            // Reset selection if the deleted device was selected
            const dev = prevList.find(
              (device) => device.fullDocument?._id === data.documentKey._id
            )?.fullDocument;

            if (
              selectedDevice &&
              selectedDevice === streamUrl(dev?.udid, dev?.security_id)
            ) {
              setSelectedDevice(null);
              setSelectedDeviceBody(null);
            }
          } else if (data.operationType === "update") {
            // Handle update operation
            const existingIndex = updatedList.findIndex(
              (device) => device.fullDocument?.udid === data.fullDocument?.udid
            );

            if (existingIndex !== -1) {
              updatedList[existingIndex] = data; // Update the existing record
            }
          } else if (data.operationType === "insert") {
            // Handle insert operation
            const existingIndex = updatedList.findIndex(
              (device) => device.fullDocument?._id === data.fullDocument?._id
            );

            if (existingIndex === -1) {
              updatedList.push(data); // Add the new record if it doesn't exist
            }
          }

          const dev = updatedList[0]?.fullDocument;
          // Automatically select the first device if none is selected

          if (updatedList.length > 0 && !selectedDevice) {
            // setSelectedDevice(streamUrl(dev?.udid, dev?.security_id));
            setSelectedDeviceBody(dev?.body);
          }

          return updatedList;
        });
      }
    };
    const baseUrl = ApiBaseUrl.getBaseUrl();
    initializeWebSocket(
      `ws://${baseUrl}/ws`,
      handleWebSocketMessage,
      (error) => {
        console.error("WebSocket error:", error);
      },
      () => {
        console.log("WebSocket connection closed");
      }
    );
    return () => {
      // ws.close();
    };
  }, [selectedDevice]);

  const fetchDevices = async () => {
    setApiLoading(true);
    try {
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://${baseUrl}/api/v1/devices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const respData = data.map((device) => {
        return { fullDocument: device };
      });

      setDeviceList(respData);
    } catch (error) {
      console.error("Error fetching devices:", error);
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
    fetchDevices();
  }, []);

  const filteredDevices = deviceList.filter(
    (device) =>
      device.fullDocument.model?.toLowerCase().includes(searchQuery) ||
      device.fullDocument.manufacturer?.toLowerCase().includes(searchQuery)
  );

  const registerDevice = async (device) => {
    setApiLoading(true);
    try {
      const baseUrl = ApiBaseUrl.getBaseUrl();
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://${baseUrl}/api/v1/registerdevice/${device.udid}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      const data = await response.json();
      let url = streamUrl(device.udid, data);
      setSelectedDevice(url);
      setSelectedDeviceBody(device);
    } catch (error) {
      console.error("Error registering device:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred.",
        severity: "error",
      });
    } finally {
      setApiLoading(false);
    }
  };

  const handleAction = (label, selectedData) => {
    console.log(
      `Button clicked: ${label} and data: ${JSON.stringify(selectedData)}`
    );
    // Perform specific logic based on the label or icon
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      {/* AppBar */}
      <AppBar
        position="static"
        sx={{
          display: "flex",
          backgroundImage: "linear-gradient(to left, #5A8DFF, #000080)",
          color: "white",
          borderRadius: "5px",
          margin: "0px",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          {/* <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, textAlign: "center" }}
          >
            {selectedDeviceName ?? ""}
          </Typography> */}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box display="flex" flexGrow={1} overflow="hidden">
        {/* Sidebar */}
        <Collapse in={drawerOpen} orientation="horizontal">
          <Box
            sx={{
              width: 240,
              height: "100%",
              backgroundImage: "#fcfcfc",
              color: "Black",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={2}
              py={1}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  flexGrow: 1,
                  textAlign: "center",
                }}
              >
                Devices List
              </Typography>
              {/* <IconButton onClick={toggleDrawer} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton> */}
            </Box>

            {/* Search */}
            <Box
              display="flex"
              alignItems="center"
              bgcolor="white"
              px={1}
              py={1}
              mx={1}
              mb={1}
              borderRadius="3px"
              border="2px solid #ccc"
            >
              <InputBase
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                fullWidth
              />
              <IconButton>
                <SearchIcon />
              </IconButton>
            </Box>

            {/* Accordion Devices */}
            {filteredDevices.map((device) => (
              <Accordion
                key={device.fullDocument.udid}
                expanded={expandedDevice === device.fullDocument.udid}
                onChange={() => handleAccordionToggle(device.fullDocument.udid)}
                sx={{
                  // backgroundImage: "#fcfcfc",
                  backgroundColor:
                    selectedDeviceBody?.udid === device.fullDocument.udid
                      ? "#5a8dff"
                      : "transparent",
                  "&:hover": {
                    backgroundColor: "#5a8dff",
                  },
                  color: "Black",
                  "&.Mui-expanded": {
                    // backgroundColor: "#0052cc",
                    border: "2px solid #5A8DFF",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "white" }} />}
                  sx={{
                    "& .MuiAccordionSummary-content": {
                      display: "flex",
                      alignItems: "center",
                    },
                    backgroundColor:
                      selectedDeviceBody?.udid === device.fullDocument.udid
                        ? "#5a8dff"
                        : "transparent",
                    borderRadius: "5px",
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor:
                        device.fullDocument?.state === "Connected"
                          ? "green"
                          : "red",
                      marginRight: "10px",
                    }}
                  />
                  <Typography ml={2}>{device.fullDocument.model}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem
                      button
                      onClick={async () => {
                        setSelectedDeviceName(device.fullDocument.model);
                        await registerDevice(device.fullDocument);
                      }}
                      sx={{
                        backgroundColor:
                          selectedDeviceBody?.udid === device.fullDocument.udid
                            ? "#5a8dff"
                            : "transparent",
                        color:
                          selectedDeviceBody?.udid === device.fullDocument.udid
                            ? "white"
                            : "inherit",
                        "&:hover": {
                          backgroundColor: "#5a8dff",
                        },
                        borderRadius: "5px",
                      }}
                    >
                      <ListItemText
                        primary={
                          <>
                            <Typography
                              variant="body1"
                              // fontWeight="bold"
                              sx={{ color: "Black" }}
                            >
                              Manufacturer: {device.fullDocument.manufacturer}
                            </Typography>
                          </>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ color: "Black" }}>
                              State: {device.fullDocument.state}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "Black" }}>
                              OS Version: {device.fullDocument.os_version}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "Black" }}>
                              CPU: {device.fullDocument.cpu}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "Black" }}>
                              SDK Version: {device.fullDocument.sdk_version}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Collapse>
        {/* Main Device Frame */}
        <Box
          flexGrow={1}
          display="flex"
          justifyContent={!selectedDevice ? "center" : "None"}
          alignItems={!selectedDevice ? "center" : "None"}
          p={2}
          overflow="hidden"
        >
          {selectedDevice ? (
            <Box display="flex" flexGrow={1} p={2} gap={4}>
              {/* Left Section - Specifications */}
              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                gap={8}
              >
                {/* CPU Row */}
                <Box display="flex" alignItems="center">
                  <MemoryIcon fontSize="small" />
                  <Typography variant="h6" sx={{ marginLeft: "4px" }}>
                    CPU
                  </Typography>
                  <Box flex={0.5} />
                  {/* Spacer to push percentage to the right */}
                  <Typography
                    variant="h6"
                    sx={{ color: "green", fontWeight: "bold" }}
                  >
                    50%
                  </Typography>
                </Box>

                {/* Battery Row */}
                <Box display="flex" alignItems="center">
                  <BatteryCharging90Icon fontSize="small" />
                  <Typography variant="h6" sx={{ marginLeft: "4px" }}>
                    Battery
                  </Typography>
                  <Box flex={0.5} />
                  <Typography
                    variant="h6"
                    sx={{ color: "green", fontWeight: "bold" }}
                  >
                    90%
                  </Typography>
                </Box>

                {/* Network Row */}
                <Box display="flex" alignItems="center">
                  <SignalCellularAltIcon fontSize="small" />
                  <Typography variant="h6" sx={{ marginLeft: "4px" }}>
                    Network
                  </Typography>
                  <Box flex={0.5} />
                  <Typography
                    variant="h6"
                    sx={{ color: "green", fontWeight: "bold" }}
                  >
                    Good
                  </Typography>
                </Box>

                {/* Memory Row */}
                <Box display="flex" alignItems="center">
                  <SdCardIcon fontSize="small" />
                  <Typography variant="h6" sx={{ marginLeft: "4px" }}>
                    Memory
                  </Typography>
                  <Box flex={0.5} />
                  <Typography
                    variant="h6"
                    sx={{ color: "green", fontWeight: "bold" }}
                  >
                    2GB
                  </Typography>
                </Box>
              </Box>

              {/* Center Section - Device Mockup */}
              <Box flex={1} display="flex" justifyContent="center">
                <iframe
                  key={selectedDevice}
                  src={selectedDevice}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              </Box>

              {/* Right Section - Feature Buttons */}
              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                gap={2}
              >
                <Typography
                  variant="h6"
                  mb={1}
                  p={1}
                  sx={{
                    backgroundColor:
                      selectedDeviceBody?.manufacturer === "samsung"
                        ? "Black"
                        : "#0052cc",
                    color: "white",
                    borderRadius: "5px",
                    alignContent: "center",
                    textAlign: "center",
                  }}
                >
                  Features of {selectedDeviceName || "Device"}
                </Typography>
                <Box
                  display="grid"
                  gridTemplateColumns="repeat(3, 1fr)"
                  gap={3}
                  m={2}
                  p={2}
                >
                  {[
                    {
                      icon: <PowerSettingsNewIcon sx={{ fontSize: "36px" }} />,
                      label: "Power",
                    },
                    {
                      icon: <VolumeUpIcon sx={{ fontSize: "36px" }} />,
                      label: "Volume Up",
                    },
                    {
                      icon: <VolumeDownIcon sx={{ fontSize: "36px" }} />,
                      label: "Volume Down",
                    },
                    {
                      icon: <PlayArrowIcon sx={{ fontSize: "36px" }} />,
                      label: "Play",
                    },
                    {
                      icon: <PauseIcon sx={{ fontSize: "36px" }} />,
                      label: "Pause",
                    },
                    {
                      icon: <StopIcon sx={{ fontSize: "36px" }} />,
                      label: "Stop",
                    },
                    {
                      icon: <CameraAltIcon sx={{ fontSize: "36px" }} />,
                      label: "Camera",
                    },
                    {
                      icon: <SettingsIcon sx={{ fontSize: "36px" }} />,
                      label: "Settings",
                    },
                    {
                      icon: <LocationOnIcon sx={{ fontSize: "36px" }} />,
                      label: "Location",
                    },
                  ].map((item, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      color="Black"
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "80px",
                        height: "80px",
                        border:
                          selectedDeviceBody?.manufacturer === "samsung"
                            ? "3px solid green"
                            : "3px solid #0052cc",
                        borderRadius: "10px",
                        textTransform: "none",
                        gap: 1,
                      }}
                      onClick={() =>
                        handleAction(item.label, selectedDeviceBody)
                      }
                    >
                      {item.icon}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography variant="h6" color="textSecondary">
              No device selected.
            </Typography>
          )}
        </Box>
      </Box>
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

export default DevicesPage;

export function streamUrl(udid, randomNumber) {
  const url = `http://127.0.0.1:8000/#!action=stream&randomNumber=${randomNumber}&udid=${udid}&player=mse&ws=ws%3A%2F%2Flocalhost%3A8000%2F%3Faction%3Dproxy-adb%26remote%3Dtcp%253A8886%26udid%3D${udid}`;
  return url;
}
