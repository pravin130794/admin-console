import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import iphone_13 from "../assets/iphone_13.png";

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
        overflow="hidden"
        bgcolor="#f8f9fa"
      >
        <Box
          position="relative"
          width="370px" // Adjusted width for accuracy
          height="810px" // Adjusted height for accuracy
          sx={{
            backgroundImage: `url(${iphone_13})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            // borderRadius: "24px",
            // boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Box
            position="absolute"
            top="7.8%" // Fine-tuned top positioning
            left="6.5%" // Fine-tuned left positioning
            width="87%" // Fine-tuned width
            height="84.9%" // Fine-tuned height
            overflow="auto"
            borderRadius="45px"
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
      </Box>
    </Box>
  );
};

export default DevicesPage;
