import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Container, Typography, Card, CardContent, Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, IconButton, CardMedia, Snackbar, FormHelperText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CardTitle from '../../../components/CardTitle';
import { LoadingButton } from '@mui/lab';
import AddRounded from '@mui/icons-material/AddRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { post, get } from 'aws-amplify/api';

const AddItems = () => {
  const [loading, setLoading] = useState(false);
  const [itemFiles, setItemFiles] = useState([]);
  const [itemFileUploads, setItemFileUploads] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const navigate = useNavigate()

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

  const handleChangeItemImage = (e) => {
    const fileList = Array.from(e.target.files);
    const totalImages = itemFiles.length + fileList.length;

    if (totalImages > 5) {
      enqueueSnackbar("You can only upload a maximum of 5 images.", { variant: "warning" });
      return;
    }

    setItemFiles(prevFiles => [...prevFiles, ...fileList.map(file => URL.createObjectURL(file))]);
    setItemFileUploads(prevFiles => [...prevFiles, ...fileList]);
    enqueueSnackbar("Successfully uploaded item pictures.", { variant: "success" });
  };

  const handleDeleteImage = (index) => {
    const updatedFiles = [...itemFiles];
    updatedFiles.splice(index, 1);
    setItemFiles(updatedFiles);

    const updatedFileUploads = [...itemFileUploads];
    updatedFileUploads.splice(index, 1);
    setItemFileUploads(updatedFileUploads);

    enqueueSnackbar("Image deleted successfully.", { variant: "success" });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };


  const formik = useFormik({
    initialValues: {
      item_name: '',
      description: '',
      location: '',
      date_found: '',
      time_found: '',
      category: '',
      brand: '',
    },
    validationSchema: Yup.object({
      item_name: Yup.string().min(3).required('Item name is required'),
      description: Yup.string().min(3).required('Description is required'),
      location: Yup.string().required('Location is required'),
      date_found: Yup.date().required('Date found is required'),
      time_found: Yup.string().matches(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
      category: Yup.string().required('Category is required'),
      brand: Yup.string()
    }),

    onSubmit: async (data) => {
      console.log(data)
      const combinedLocation = data.roomNumber ? `${data.location}.${data.roomNumber}` : data.location;
      data.location = combinedLocation;

      setLoading(true);

      // Prepare FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append('item_name', data.item_name);
      formData.append('description', data.description);
      formData.append('location', combinedLocation);
      formData.append('date_found', data.date_found);
      formData.append('time_found', data.time_found);
      formData.append('category', data.category);
      formData.append('brand', data.brand);

      // Convert and append base64 images
      for (let file of itemFileUploads) {
        formData.append('images', file);
      }

      try {
        console.log("Final formData being sent:", formData);
        const response = post({
          apiName: "lostandfound",
          path: "/item/create",
          options: {
            body: formData,
          },
        });

        const res = await response.response;
        let result = "";
        let done = false;

        // Handle streamed response
        if (res.body && typeof res.body.getReader === "function") {
          const reader = res.body.getReader();
          while (!done) {
            const { value, done: isDone } = await reader.read();
            done = isDone;
            if (value) result += new TextDecoder().decode(value);
          }
        }

        // Parse and handle the response
        let parsedData = result;
        console.log(parsedData);

        enqueueSnackbar("Item added successfully", { variant: "success" });
        navigate("/staff")
      } catch (err) {
        console.log("Error during item upload:", err);
        enqueueSnackbar("Error uploading item", { variant: "error" });
      } finally {
        setLoading(false);
      }
    },

  });

  const handleCategoryChange = (event) => {
    formik.setFieldValue('category', event.target.value);
  };

  const handleBrandChange = (event) => {
    formik.setFieldValue('brand', event.target.value);
  };

  const handleLocationChange = (event) => {
    formik.setFieldValue('location', event.target.value);
  };

  const handleRoomNumberChange = (event) => {
    setRoomNumber(event.target.value);
  };

  return (
    <Container maxWidth="xl" sx={{ marginTop: '1rem' }}>
      <Card sx={{ margin: 'auto' }}>
        <CardContent>
        <Typography display={{ xs: "none", md: "flex" }} variant="h4" fontWeight={700} my={"1rem"}>Create an Item Found</Typography>
          <Grid container spacing={2}>
            {/* Left side - Product Information */}
            <Grid item xs={12} sm={6}>
              <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="item_name"
                      name="item_name"
                      label="Item Name *"
                      variant="outlined"
                      value={formik.values.item_name}
                      onChange={formik.handleChange}
                      error={formik.touched.item_name && Boolean(formik.errors.item_name)}
                      helperText={formik.touched.item_name && formik.errors.item_name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="description"
                      name="description"
                      label="Description *"
                      variant="outlined"
                      multiline
                      rows={4}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText="Describe the item's color, texture, brand, and any other information that can help the owner find it."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="location-select-label">Location *</InputLabel>
                      <Select
                        labelId="location-select-label"
                        id="location-select"
                        value={formik.values.location}
                        label="Location"
                        onChange={handleLocationChange}
                        error={formik.touched.location && Boolean(formik.errors.location)}
                      >
                        <MenuItem value="SAS">School of Applied Science (Blk P, Q)</MenuItem>
                        <MenuItem value="SBM">School of Business Management (Blk B, C, D)</MenuItem>
                        <MenuItem value="SDM">School of Design & Media (Blk M, R)</MenuItem>
                        <MenuItem value="SEG">School of Engineering (Blk R, S)</MenuItem>
                        <MenuItem value="SHSS">School of Health & Social Sciences (Blk H, J, K)</MenuItem>
                        <MenuItem value="SIT">School of Information Technology (Blk L)</MenuItem>
                        <MenuItem value="T-Junction">T-Junction</MenuItem>
                        <MenuItem value="Gym">Gym</MenuItem>
                        <MenuItem value="Swimming Pool">Swimming Pool</MenuItem>
                      </Select>
                      {formik.touched.location && formik.errors.location && (
                        <FormHelperText error>{formik.errors.location}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="room_number"
                      name="room_number"
                      label="Room Number (Optional)"
                      variant="outlined"
                      value={roomNumber}
                      onChange={handleRoomNumberChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="date_found"
                      name="date_found"
                      label="Date Found (DD/MM/YYYY) *"
                      variant="outlined"
                      type="date"
                      value={formik.values.date_found}
                      onChange={formik.handleChange}
                      error={formik.touched.date_found && Boolean(formik.errors.date_found)}
                      helperText={formik.touched.date_found && formik.errors.date_found}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="time_found"
                      name="time_found"
                      label="Time Found (HH:MM)"
                      variant="outlined"
                      type="time"
                      value={formik.values.time_found}
                      onChange={formik.handleChange}
                      error={formik.touched.time_found && Boolean(formik.errors.time_found)}
                      helperText={formik.touched.time_found && formik.errors.time_found}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="category-select-label">Category *</InputLabel>
                      <Select
                        labelId="category-select-label"
                        id="category-select"
                        value={formik.values.category}
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="brand-select-label">Brand</InputLabel>
                      <Select
                        labelId="brand-select-label"
                        id="brand-select"
                        value={formik.values.brand}
                        label="Brand"
                        onChange={handleBrandChange}
                      >
                        <MenuItem value="Others">Others</MenuItem>
                        <MenuItem value="Apple">Apple</MenuItem>
                        <MenuItem value="Samsung">Samsung</MenuItem>
                        <MenuItem value="Nike">Nike</MenuItem>
                        <MenuItem value="Sony">Sony</MenuItem>
                        <MenuItem value="Adidas">Adidas</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LoadingButton
                      className="loading-button"
                      onClick={formik.handleSubmit}
                      loading={loading}
                      loadingPosition="start"
                      startIcon={<AddRounded />}
                      variant="contained"
                    >
                      {loading ? "Submitting..." : "Create"}
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Right side - Upload Images */}
            <Grid item xs={12} sm={6}>
              <Alert severity="warning" icon={<WarningIcon fontSize="inherit" />} sx={{ marginBottom: '1rem' }}>
                Important: Do not upload sensitive information (e.g., NRIC, DOB)
              </Alert>
              <Grid container spacing={2}>
                {itemFiles.map((file, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card>
                      <CardMedia component="img" image={file} alt="Item image" />
                      <IconButton onClick={() => handleDeleteImage(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Button variant="contained" component="label" fullWidth sx={{ marginTop: '1rem' }}>
                Upload Images
                <input hidden accept="image/*" onChange={handleChangeItemImage} multiple type="file" />
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddItems;
