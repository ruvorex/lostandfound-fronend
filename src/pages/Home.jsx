import React, { useState, useEffect, useRef } from 'react';
import LostFoundCard from "../components/LostFoundCard";
import { FilterListRounded } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
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
  Divider
} from "@mui/material";
import SearchBarDate from '../components/SearchBar_Date';
import { styled } from '@mui/system';
import { enqueueSnackbar } from 'notistack';
import { get} from 'aws-amplify/api';


const Home = () => {
  const [items, setItems] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [locationFilters, setLocationFilters] = useState({
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
  const [showNavbar, setShowNavbar] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const itemsRef = useRef(null);

  const StyledTitle = styled(Typography)(({ theme }) => ({
    color: 'white',
    marginBottom: theme.spacing(3),
    fontWeight: 'bold',
    textShadow: '0 10px 20px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.5)',
  }));

  // Fetch items using handleGetItems
  useEffect(() => {
    const handleGetItems = async () => {
      try {
        const req = get({
          apiName: 'lostandfound',
          path: '/items',
        });
        const res = await req.response;
        const data = await res.body.json();
        const formattedData = data.items.map((item) => ({
          ...item,
          date_found: new Date(item.found_at).toLocaleDateString(),
        }));
        console.log(formattedData)
        setItems(formattedData);
        setFilteredData(formattedData);
      } catch (err) {
        console.error(err);
        enqueueSnackbar('Failed to fetch items', { variant: 'error' });
      }
    };
    handleGetItems();
  }, []);

  const handleCategoryChange = (event) => setCategory(event.target.value);
  const handleLocationChange = (event) => {
    setLocationFilters({
      ...locationFilters,
      [event.target.name]: event.target.checked,
    });
  };
  const handleSortChange = (event) => setSortOrder(event.target.value);

  useEffect(() => {
    const applyFiltersAndSorting = () => {
      let filtered = [...items];

      if (category) {
        filtered = filtered.filter(
          (item) => item.category?.toLowerCase().includes(category.toLowerCase())
        );
      }

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

      if (sortOrder === "dateOldest") {
        filtered.sort((a, b) => new Date(a.date_found) - new Date(b.date_found));
      } else if (sortOrder === "dateNewest") {
        filtered.sort((a, b) => new Date(b.date_found) - new Date(a.date_found));
      }

      setFilteredData(filtered);
    };

    applyFiltersAndSorting();
  }, [category, locationFilters, items, sortOrder]);

  const handleSearch = (query, searchDate) => {
    let filtered = [...items];

    if (category) {
      filtered = filtered.filter(
        (item) => item.category?.toLowerCase().includes(category.toLowerCase())
      );
    }

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

    if (query) {
      filtered = filtered.filter((item) =>
        item.item_name?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (searchDate) {
      const formattedSearchDate = searchDate.format("YYYY-MM-DD");
      filtered = filtered.filter((item) => item.date_found === formattedSearchDate);
    }

    setSortOrder("");
    setFilteredData(filtered);

    if (!showNavbar) {
      setShowNavbar(true);
      if (itemsRef.current) {
        itemsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleClearFilters = () => {
    setCategory("");
    setSortOrder("");
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
    setFilteredData(items);
  };

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
    <Box sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'relative',
          height: showNavbar ? '25vh' : '100vh',
          overflow: 'hidden',
          transition: 'height 0.5s ease',
        }}
      >
        <Box
          component="img"
          src="/image.png"
          alt="Background"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(5px)',
            zIndex: -1,
            transform: 'scale(1.1)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: showNavbar ? 'translate(-50%, -50%)' : 'translate(-50%, -90%)',
            textAlign: 'center',
          }}
        >
          <StyledTitle variant="h3">
            Welcome to NYP Lost and Found
          </StyledTitle>
          <Box>
            <SearchBarDate onSearch={handleSearch} />
          </Box>
        </Box>
      </Box>

      {showNavbar && (
        <Container maxWidth="lg" sx={{ mt: 4 }} ref={itemsRef}>
          <Grid container spacing={2} sx={{ mt: 2 }}>
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

            <Grid item xs={9}>
              <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Displaying {filteredData.length} of {items.length} items
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
                        image={item.image_url && JSON.parse(item.image_url)[0]}
                        itemName={item.item_name}
                        description={item.description}
                        location={item.location}
                        dateFound={item.date_found}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Grid>
          </Grid>
        </Container>
      )}

      {showPrompt && (
        <Box
          sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '10px 20px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
          onClick={() => {
            setShowPrompt(false);
            setShowNavbar(true);
          }}
        >
          <InfoIcon fontSize="small" />
          <Typography variant="body1" fontWeight="bold" fontSize="18px">
            Unsure what to search? Click here!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Home;
