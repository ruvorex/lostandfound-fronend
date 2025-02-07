import React, { useState, useEffect, useRef } from 'react';
import LostFoundCard from "../components/LostFoundCard";
import { ArrowForwardRounded, CloseRounded, NotificationsActiveRounded, NotificationsOffRounded, CategoryRounded, FilterListRounded, CheckRounded } from '@mui/icons-material'
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent, Stepper, Step, StepLabel, DialogContentText, TextField , DialogActions, Chip
} from "@mui/material";
import SearchBarDate from '../components/SearchBar_Date';
import ItemDialog from '../components/ItemDialog';
import { styled } from '@mui/system';
import { enqueueSnackbar } from 'notistack';
import { get, post } from 'aws-amplify/api'
import { LoadingButton } from '@mui/lab'
import { useSnackbar } from "notistack"
import { useFormik } from 'formik'
import * as Yup from 'yup'

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
  const [subcribeCatergoryDialog, setSubcribeCategoryDialog] = useState(false)
  const [subscribeStep, setSubscribeStep] = useState(0)
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const [emailCategory, setEmailCategory] = useState([])
  const { enqueueSnackbar } = useSnackbar()
  const itemsRef = useRef(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsId, setDetailsId] = useState(null);

  const handleDetailsOpen = (id) => {
      setDetailsId(id);
      setDetailsDialogOpen(true);
  }

  const handleDetailsClose = () => {
      setDetailsDialogOpen(false);
  }

  const subscribeFormik = useFormik({
    initialValues: {
      email: "",
      emailCategoryIds: []
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("E-mail is required"),
    }),
    onSubmit: async (data) => {
      setSubscribeLoading(true)
      data.email = data.email.trim()

      var subReq = post({
        apiName: "lostandfound",
        path: "/subscriptions?email=" + data.email,
        options: {
          body: {
            categoryIds: data.emailCategoryIds
          }
        }
      })

      try {
        var res = await subReq.response
        var data = await res.body.json()
        setSubscribeLoading(false)
        setSubscribeStep(2)
      } catch (err) {
        console.log(err)
        enqueueSnackbar("Failed to subscribe to email categories", { variant: "error" })
        setSubscribeLoading(false)
      }
    }
  })

  const confirmFormik = useFormik({
    initialValues: {
      code: ""
    },
    validationSchema: Yup.object({
      code: Yup.string().required("Confirmation code is required")
    }),
    onSubmit: async (data) => {
      setSubscribeLoading(true)
      data.code = data.code.trim()
      data.email = subscribeFormik.values.email

      var subReq = get({
        apiName: "lostandfound",
        path: "/subscriptions/verify?email=" + data.email + "&token=" + data.code
      })

      try {
        var res = await subReq.response
        var data = await res.body.json()
        setSubscribeLoading(false)
        setSubscribeStep(3)
      } catch (err) {
        console.log(err)
        enqueueSnackbar("Failed to verify subscription", { variant: "error" })
        setSubscribeLoading(false)
      }
    }
  })

  const handleGetEmailCategories = async () => {
    var itemReq = get({
      apiName: "lostandfound",
      path: "/category",
    })

    try {
      var res = await itemReq.response
      var data = await res.body.json()
      setEmailCategory(data.category)
    } catch (err) {
      console.log(err)
      enqueueSnackbar("Failed to load email categories", { variant: "error" })
    }
  }

  const handleSubscribeCategoryClose = () => {
    setSubscribeStep(0)
    subscribeFormik.resetForm()
    setSubscribeLoading(false)
    setSubcribeCategoryDialog(false)
  }

  const handleSubscribeCategoryOpen = () => {
    setSubcribeCategoryDialog(true)
  }

  const handleSubscribeCategoryNext = async () => {
    setSubscribeLoading(true)

    var subReq = get({
      apiName: "lostandfound",
      path: "/subscriptions?email=" + subscribeFormik.values.email
    })

    try {
      var res = await subReq.response
      var data = await res.body.json()
      var subCategories = data.map((sub) => sub.categoryId)
      subscribeFormik.setFieldValue("emailCategoryIds", subCategories)
      setSubscribeLoading(false)
      setSubscribeStep(1)
    } catch (err) {
      console.log(err)
      enqueueSnackbar("Failed to load subscriptions", { variant: "error" })
      setSubscribeLoading(false)
    }
  }

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
        const formattedData = data.items
          .filter((item) => item.status !== 'claimed') 
          .map((item) => ({
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
    handleGetEmailCategories()
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
        <Container maxWidth="xl" sx={{ mt: 4 }} ref={itemsRef}>
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

                <Button variant="contained" startIcon={<ArrowForwardRounded />} onClick={handleSubscribeCategoryOpen} fullWidth >Subscribe to Categories</Button>

                <Divider sx={{ my: 2 }} />

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
                <Grid container spacing={4} sx={{ mb: 4 }}>
                  {filteredData.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <LostFoundCard
                        image={item.image_url && JSON.parse(item.image_url)[0]}
                        itemName={item.item_name}
                        description={item.description}
                        location={item.location}
                        dateFound={item.date_found}
                        onViewDetails={() => handleDetailsOpen(item.id)}
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

      <Dialog open={subcribeCatergoryDialog} maxWidth={"sm"} fullWidth onClose={handleSubscribeCategoryClose}>
        <DialogTitle>Subscribe to Email Categories</DialogTitle>
        <DialogContent>
          <Stepper activeStep={subscribeStep} alternativeLabel>
            <Step>
              <StepLabel>Enter E-mail</StepLabel>
            </Step>
            <Step>
              <StepLabel>Select Categories</StepLabel>
            </Step>
            <Step>
              <StepLabel>Verify E-mail</StepLabel>
            </Step>
          </Stepper>
        </DialogContent>
        <Box display={subscribeStep == 0 ? "initial" : "none"}>
          <DialogContent sx={{ paddingTop: 0 }}>
            <DialogContentText>
              Enter your e-mail address to subscribe to email categories. You will receive notifications when new items are added to the selected categories.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="email"
              label="E-mail Address"
              type="email"
              name="email"
              fullWidth
              variant="standard"
              value={subscribeFormik.values.email}
              onChange={subscribeFormik.handleChange}
              error={subscribeFormik.touched.email && Boolean(subscribeFormik.errors.email)}
              helperText={subscribeFormik.touched.email && subscribeFormik.errors.email}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSubscribeCategoryClose} startIcon={<CloseRounded />}>Cancel</Button>
            <LoadingButton type="submit" loadingPosition="start" loading={subscribeLoading} variant="text" color="primary" startIcon={<ArrowForwardRounded />} onClick={handleSubscribeCategoryNext}>Next Step</LoadingButton>
          </DialogActions>
        </Box>
        <Box display={subscribeStep == 1 ? "initial" : "none"}>
          <DialogContent sx={{ paddingTop: 0 }}>
            <DialogContentText>
              Select the email categories you would like to subscribe to.
            </DialogContentText>
            <Select
              sx={{ mt: "1rem" }}
              multiple
              fullWidth
              value={subscribeFormik.values.emailCategoryIds}
              onChange={(e) => subscribeFormik.setFieldValue("emailCategoryIds", e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip icon={<CategoryRounded />} key={value} label={emailCategory.find((cat) => cat.id == value).name} />
                  ))}
                </Box>
              )}
            >
              {emailCategory.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
            <Button sx={{ width: "100%", mt: "0.5rem" }} variant="secondary" startIcon={<NotificationsOffRounded />} onClick={() => subscribeFormik.setFieldValue("emailCategoryIds", [])}>
              Unsubscribe from all...
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSubscribeCategoryClose} startIcon={<CloseRounded />}>Cancel</Button>
            <LoadingButton type="submit" loadingPosition="start" loading={subscribeLoading} variant="text" color="primary" startIcon={<ArrowForwardRounded />} onClick={subscribeFormik.handleSubmit}>Next Step</LoadingButton>
          </DialogActions>
        </Box>
        <Box display={subscribeStep == 2 ? "initial" : "none"} component="form" onSubmit={confirmFormik.handleSubmit}>
          <DialogContent sx={{ paddingTop: 0 }}>
            <DialogContentText>
              An e-mail verification has been sent to your mailbox.<br />Enter the code sent to your e-mail to confirm your subscription.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="code"
              label="Confirmation Code"
              type="text"
              name="code"
              fullWidth
              variant="standard"
              value={confirmFormik.values.code}
              onChange={confirmFormik.handleChange}
              error={confirmFormik.touched.code && Boolean(confirmFormik.errors.code)}
              helperText={confirmFormik.touched.code && confirmFormik.errors.code}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSubscribeCategoryClose} startIcon={<CloseRounded />}>Cancel</Button>
            <LoadingButton type="submit" loadingPosition="start" loading={subscribeLoading} variant="text" color="primary" startIcon={<CheckRounded />}>Verify</LoadingButton>
          </DialogActions>
        </Box>
        <Box display={subscribeStep == 3 ? "initial" : "none"}>
          <DialogContent sx={{ paddingTop: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <NotificationsActiveRounded sx={{ fontSize: "3rem" }} />
              <DialogContentText sx={{ textAlign: "center", marginTop: "0.5rem" }}>
                <Typography fontWeight={700}>Subscriptions have been set!</Typography>
                <Typography>You will now receive notifications when new items are added to the selected email categories.</Typography>
              </DialogContentText>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSubscribeCategoryClose} startIcon={<CloseRounded />}>Done</Button>
          </DialogActions>
        </Box>
      </Dialog>
      <ItemDialog open={detailsDialogOpen} onClose={handleDetailsClose} itemId={detailsId} guestMode />
    </Box>
  );
};

export default Home;
