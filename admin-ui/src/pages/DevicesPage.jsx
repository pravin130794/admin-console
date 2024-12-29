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
import galaxy_s24 from "../assets/samsung-galaxy-s24-ultra.png";
import iphone_8 from "../assets/apple-iphone-8-gold-portrait.png";

const DevicesPage = () => {
  const deviceList = [
    {
      name: "Iphone 13",
      details: "IOS 18",
      url: "https://fr.wikipedia.org/wiki/IPhone_13",
      body: {
        image: iphone_13,
        frameStyles: {
          top: "7.8%",
          left: "6.5%",
          width: "87%",
          height: "84.9%",
          borderRadius: "45px",
        },
      },
    },
    {
      name: "Galaxy S7",
      details: "Android 6.0",
      url: "https://fr.wikipedia.org/wiki/Samsung_Galaxy_S7",
      body: {
        image: galaxy_s24,
        frameStyles: {
          top: "8%",
          left: "6%",
          width: "86%",
          height: "85%",
          borderRadius: "1px",
        },
      },
    },
    {
      name: "Iphone 8",
      details: "IOS",
      url: "https://fr.wikipedia.org/wiki/Samsung_Galaxy_S7",
      body: {
        image: iphone_8,
        frameStyles: {
          top: "15%",
          left: "7%",
          width: "86%",
          height: "70%",
          borderRadius: "1px",
        },
      },
    },
  ];
  
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedDeviceBody, setSelectedDeviceBody] = useState(
    deviceList[0].body
  );

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
              onClick={() => {
                setSelectedDevice(device.url);
                setSelectedDeviceBody(device.body);
              }}
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
            backgroundImage: `url(${selectedDeviceBody.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Box
            position="absolute"
            sx={{
              ...selectedDeviceBody.frameStyles, // Apply dynamic styles
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
      </Box>
    </Box>
  );
};

export default DevicesPage;
