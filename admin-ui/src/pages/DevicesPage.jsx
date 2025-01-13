import { useState, useEffect } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SnackbarComponent from "../components/Snackbar";

const DevicesPage = () => {
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [selectedDeviceBody, setSelectedDeviceBody] = useState({});
  const [selectedDeviceName, setSelectedDeviceName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [expandedDevice, setExpandedDevice] = useState(null);
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
    const ws = new WebSocket("ws://127.0.0.1:8001/ws"); // Replace with your WebSocket server URL

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
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
            let dev = prevList.find(
              (device) => device.fullDocument?._id === data.documentKey._id
            )?.fullDocument;

            if (
              selectedDevice &&
              selectedDevice === streamUrl(dev?.udid, dev?.security_id)
            ) {
              setSelectedDevice("");
              setSelectedDeviceBody({});
            }
          } else if (data.operationType === "update") {
            if (updatedList.length == 0) {
              updatedList.push(data);
            }
            // Handle update operation
            const existingIndex = updatedList.findIndex((device) => {
              return device.fullDocument?.udid === data.fullDocument?.udid;
            });

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

          let dev = updatedList[0].fullDocument;
          // Automatically select the first device if none is selected
          if (updatedList.length > 0 && !selectedDevice) {
            setSelectedDevice(streamUrl(dev?.udid, dev?.security_id));
            setSelectedDeviceBody(dev?.body);
          }

          return updatedList;
        });
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [selectedDevice]);

  const fetchDevices = async () => {
    setApiLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://127.0.0.1:8001/api/v1/devices`, {
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
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://127.0.0.1:8001/api/v1/registerdevice/${device.udid}`,
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
      console.log("Device registration response:", url);
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
          justifyContent="center"
          alignItems="center"
          p={2}
          overflow="hidden"
        >
          {selectedDevice ? (
            <Box
              position="relative"
              width="35%"
              height="104%"
              // sx={{
              //   backgroundImage: "",
              //   backgroundSize: "cover",
              //   backgroundPosition: "center",
              // }}
            >
              <Box
                position="absolute"
                sx={{
                  top: "7%",
                  left: "6%",
                  width: "117%",
                  height: "100%",
                  borderRadius: "1px",
                  overflow: "auto",
                }}
              >
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
