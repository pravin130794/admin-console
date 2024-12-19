import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Paper,
} from "@mui/material";

const DevicesPage = () => {
  const [selectedDevice, setSelectedDevice] = useState(
    "https://fr.wikipedia.org/wiki/Main_Page"
  );

  const deviceList = [
    { name: "Chrome 89", details: "Big Sur", url: "https://www.google.com" },
    {
      name: "Galaxy S7",
      details: "Android 6.0",
      url: "https://www.samsung.com",
    },
    {
      name: "Chrome 70",
      details: "Windows 10",
      url: "https://www.microsoft.com",
    },
    { name: "Opera 74", details: "Windows 10", url: "https://www.opera.com" },
    {
      name: "Firefox 88(Beta)",
      details: "Windows 10",
      url: "https://www.mozilla.org",
    },
  ];

  return (
    <Box display="flex" height="100vh" bgcolor="#f0f0f0">
      {/* Device List Box */}
      <Box
        width="300px"
        bgcolor="white"
        borderRight="1px solid #ddd"
        p={2}
        overflow="auto"
      >
        <Typography variant="h6" gutterBottom>
          Device List
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {deviceList.map((device, index) => (
            <ListItem
              key={index}
              button
              onClick={() => setSelectedDevice(device.url)}
              sx={{
                mb: 1,
                border: "1px solid #ddd",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              <ListItemText
                primary={device.name}
                secondary={device.details}
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
      >
        <Paper
          elevation={3}
          sx={{
            width: 375,
            height: 812,
            borderRadius: "24px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
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
        </Paper>
      </Box>
    </Box>
  );
};

export default DevicesPage;
