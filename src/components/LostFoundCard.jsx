import React, { useState } from "react";
import { Card, CardContent, CardMedia, Typography, Box, Button } from "@mui/material";
import { Link } from "react-router-dom";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const LostFoundCard = ({ image, itemName, description, location, dateFound, contact }) => {
  // Use state to toggle detailed view
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleToggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const date = new Date(dateFound);
  const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;


  return (
    <Card sx={{ maxWidth: 345, borderRadius: "12px", boxShadow: 3, height: 400 }}>
      <CardMedia component="img" height="160" image={image} alt={itemName} />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {itemName}
        </Typography>

        {/* Description with truncation */}
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            WebkitLineClamp: showFullDescription ? "none" : 3, 
          }}
          gutterBottom
        >
          {description}
        </Typography>

        {/* Location and Date Found with Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <LocationOnIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            {location}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body2" color="textSecondary">
            {formattedDate}
          </Typography>
        </Box>

        {/* Button to view more details */}
        <Box mt={2}>
          <Link to={`/item-details/${itemName}`}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                textTransform: "none",
                fontSize: "0.875rem",
              }}
            >
              Click for More Details
            </Button>
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LostFoundCard;
