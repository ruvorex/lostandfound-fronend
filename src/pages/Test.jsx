import React, { useState, useEffect } from 'react';
import LostFoundCard from "../components/LostFoundCard";
import { FilterListRounded } from '@mui/icons-material';
import {
  Box,
  Grid,
  Typography,
  Button,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
} from "@mui/material";
import SearchBarDate from '../components/SearchBar_Date';
import Papa from "papaparse";

const Test = () => {
  const [csvData, setCsvData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState(""); // Default to "Relevance"
  const [locationFilters, setLocationFilters] = useState({
    "SAS": false, // School of Applied Science
    "SBM": false, // School of Business Management
    "SDM": false, // School of Design & Media
    "SEG": false, // School of Engineering
    "SHSS": false, // School of Health & Social Sciences
    "SIT": false, // School of Information Technology
    "T-Junction": false,
    "Gym": false,
    "Swimming Pool": false,
  });

  const handleCategoryChange = (event) => setCategory(event.target.value);
  
  const handleLocationChange = (event) => {
    setLocationFilters({
      ...locationFilters,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSortChange = (event) => setSortOrder(event.target.value);

  // Fetch and parse CSV data
  useEffect(() => {
    const fetchCsvData = async () => {
      const response = await fetch('../../../lost_and_found_items.csv');
      const text = await response.text();
      Papa.parse(text, {
        complete: (result) => {
          const parsedData = result.data.map((item) => ({
            ...item,
            location: item.location?.trim(),
            category: item.category?.trim(),
          }));
          setCsvData(parsedData);
          setFilteredData(parsedData);
        },
        header: true,
        skipEmptyLines: true,
      });
    };
    fetchCsvData();
  }, []);

  // Sort and filter data
  useEffect(() => {
    const applyFiltersAndSorting = () => {
      let filtered = [...csvData];

      // Apply category filter
      if (category) {
        filtered = filtered.filter(
          (item) => item.category?.toLowerCase() === category.toLowerCase()
        );
      }

      // Apply location filter
      const activeLocations = Object.keys(locationFilters).filter(
        (key) => locationFilters[key]
      );
      if (activeLocations.length > 0) {
        filtered = filtered.filter((item) =>
          activeLocations.some((location) =>
            item.location?.toLowerCase().includes(location.toLowerCase())
          )
        );
      }

      // Sort based on sortOrder
      if (sortOrder === "dateOldest") {
        filtered.sort((a, b) => new Date(a.date_found) - new Date(b.date_found));
      } else if (sortOrder === "dateNewest") {
        filtered.sort((a, b) => new Date(b.date_found) - new Date(a.date_found));
      }

      setFilteredData(filtered);
    };

    applyFiltersAndSorting();
  }, [category, locationFilters, csvData, sortOrder]);

  const handleSearch = (query, searchDate) => {
    let filtered = csvData;

    // Apply category filter
    if (category) {
      filtered = filtered.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply location filter
    const activeLocations = Object.keys(locationFilters).filter(
      (key) => locationFilters[key]
    );
    if (activeLocations.length > 0) {
      filtered = filtered.filter((item) =>
        activeLocations.some((location) =>
          item.location?.toLowerCase().includes(location.toLowerCase())
        )
      );
    }

    // Apply search query filter
    if (query) {
      filtered = filtered.map((item) => ({
        ...item,
        relevance:
          (item.item_name?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0) +
          (item.description?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0),
      }));
      filtered.sort((a, b) => b.relevance - a.relevance);
    }

    // Apply date filter
    if (searchDate) {
      const formattedSearchDate = searchDate.format("YYYY-MM-DD");
      filtered = filtered.filter((item) => item.date_found === formattedSearchDate);
    }

    setSortOrder(""); // Reset sort order to Relevance after a search
    setFilteredData(filtered);
  };

  const handleClearFilters = () => {
    setCategory("");
    setSortOrder(""); // Reset sort order
    setLocationFilters({
      "SAS": false,
      "SBM": false,
      "SDM": false,
      "SEG": false,
      "SHSS": false,
      "SIT": false,
      "T-Junction": false,
      "Gym": false,
      "Swimming Pool": false,
    });
    setFilteredData(csvData);
  };

  // Map abbreviations to full names for display
  const locationDisplayNames = {
    "SAS": "School of Applied Science (Blk P, Q)",
    "SBM": "School of Business Management (Blk B, C, D)",
    "SDM": "School of Design & Media (Blk M, R)",
    "SEG": "School of Engineering (Blk R, S)",
    "SHSS": "School of Health & Social Sciences (Blk H, J, K)",
    "SIT": "School of Information Technology (Blk L)",
    "T-Junction": "T-Junction",
    "Gym": "Gym",
    "Swimming Pool": "Swimming Pool",
  };

  return (
    <Box>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <SearchBarDate onSearch={handleSearch} />
        <Grid container spacing={2} sx={{ mt: 2 }}>

          {/* Filters Section */}
          <Grid item xs={3}>
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2, boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FilterListRounded sx={{ marginRight: '8px', color: 'primary.main' }} />
                <Typography variant="h6" sx={{ marginRight: '8px', fontWeight: 'bold' }}>
                  Filter
                </Typography>
                <Button variant="text" color="primary" onClick={handleClearFilters} sx={{ fontWeight: 'bold' }}>
                  Clear All
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={category}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Clothing">Clothing</MenuItem>
                  <MenuItem value="Stationery">Stationery</MenuItem>
                  <MenuItem value="Wallets & Pouches">Wallets & Pouches</MenuItem>
                  <MenuItem value="Keys">Keys</MenuItem>
                  <MenuItem value="Accessories">Accessories</MenuItem>
                  <MenuItem value="Bags">Bags</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Location Lost
              </Typography>
              <FormGroup sx={{ mb: 3 }}>
                {Object.keys(locationFilters).map((key) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        checked={locationFilters[key]}
                        onChange={handleLocationChange}
                        name={key}
                      />
                    }
                    label={locationDisplayNames[key]}
                  />
                ))}
              </FormGroup>
            </Box>
          </Grid>

          {/* Lost Items Section */}
          <Grid item xs={9}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Displaying {filteredData.length} of {csvData.length} items
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={sortOrder}
                    displayEmpty
                    onChange={handleSortChange}
                    inputProps={{ 'aria-label': 'Sort By' }}
                  >
                    <MenuItem value="">Relevance</MenuItem>
                    <MenuItem value="dateOldest">Date (Oldest to Newest)</MenuItem>
                    <MenuItem value="dateNewest">Date (Newest to Oldest)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Grid container spacing={4}>
                {filteredData.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <LostFoundCard
                      image={item.image_url}
                      itemName={item.item_name}
                      description={item.description}
                      location={item.location}
                      dateFound={item.date_found}
                      timeFound={item.time_found}
                    />
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Test;
