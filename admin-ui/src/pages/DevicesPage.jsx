import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Backdrop,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

const DevicesPage = () => {
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [selectedDeviceBody, setSelectedDeviceBody] = useState({});
  const encodeUrl = "";
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
      const response = await fetch(`http://127.0.0.1:8001/api/v1/devices`);
      const data = await response.json();
      const respData = data.map((device) => {
        return { fullDocument: device };
      });

      setDeviceList(respData);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

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
      setSelectedDeviceBody(device.body);
      console.log("Device registration response:", url);
    } catch (error) {
      console.error("Error registering device:", error);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <Box display="flex" height="100vh" overflow="hidden">
      {/* Device List Box */}
      <Box
        width="300px"
        bgcolor="white"
        borderRight="1px solid #ddd"
        p={2}
        sx={{ overflowY: "auto" }}
      >
        <Typography variant="h6" gutterBottom>
          Device List
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {deviceList.map((device, index) => (
            <ListItem
              key={device.fullDocument?._id || `device-${index}`}
              button
              onClick={async () => {
                await registerDevice(device.fullDocument);
              }}
              sx={{
                mb: 1,
                border: "1px solid #ddd",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#f0f8ff" },
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
              <ListItemText
                primary={device.fullDocument?.model}
                secondary={device.fullDocument?.manufacturer}
                primaryTypographyProps={{ fontWeight: "bold" }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

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
                src={selectedDevice}
                title="Device Frame"
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
