import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

const DevicesPage = () => {
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedDeviceBody, setSelectedDeviceBody] = useState({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws"); // Replace with your WebSocket server URL

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
              (device) => device.fullDocument._id !== data.documentKey._id
            );

            // Reset selection if the deleted device was selected
            if (
              selectedDevice &&
              selectedDevice ===
                prevList.find(
                  (device) => device.fullDocument._id === data.documentKey._id
                )?.fullDocument.url
            ) {
              setSelectedDevice("");
              setSelectedDeviceBody({});
            }
          } else if (data.operationType === "update") {
            // Handle update operation
            const existingIndex = updatedList.findIndex(
              (device) => device.fullDocument._id === data.fullDocument._id
            );
            if (existingIndex !== -1) {
              updatedList[existingIndex] = data; // Update the existing record
            } else {
              updatedList.push(data); // Add the new record if it doesn't exist
            }
          } else if (data.operationType === "insert") {
            // Handle insert operation
            const existingIndex = updatedList.findIndex(
              (device) => device.fullDocument._id === data.fullDocument._id
            );

            if (existingIndex === -1) {
              updatedList.push(data); // Add the new record if it doesn't exist
            }
          }

          // Automatically select the first device if none is selected
          if (updatedList.length > 0 && !selectedDevice) {
            setSelectedDevice(updatedList[0].fullDocument.url);
            setSelectedDeviceBody(updatedList[0].fullDocument.body);
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

  const handleDeviceClick = (device) => {
    setSelectedDevice(device.url);
    setSelectedDeviceBody(device.body);
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
              key={device.fullDocument._id || `device-${index}`}
              button
              onClick={() => handleDeviceClick(device.fullDocument)}
              sx={{
                mb: 1,
                border: "1px solid #ddd",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor:
                    device.fullDocument.status === "true" ? "green" : "red",
                  marginRight: "10px",
                }}
              />
              <ListItemText
                primary={device.fullDocument.name}
                secondary={device.fullDocument.details}
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
            width="370px"
            height="810px"
            sx={{
              backgroundImage: `url(../src/assets/${
                selectedDeviceBody?.image || ""
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <Box
              position="absolute"
              sx={{
                ...selectedDeviceBody?.frameStyles, // Apply dynamic styles
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
    </Box>
  );
};

export default DevicesPage;
