import React, { useEffect, useState } from 'react';
import {
    Dialog, AppBar, Toolbar, IconButton, Typography, CircularProgress, Stack, Button, Divider, Box, Alert, TextField,
    Card, CardMedia, Grid, MenuItem, Chip
} from '@mui/material';
import { CloseRounded, EditRounded, SaveRounded, EditOffRounded, RefreshRounded, Delete } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { get, put } from 'aws-amplify/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { enqueueSnackbar } from 'notistack';

export default function ItemDialog({ open, onClose, itemId, onUpdate }) {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [itemFiles, setItemFiles] = useState([]);
    const [itemFileUploads, setItemFileUploads] = useState([]);

    const formik = useFormik({
        initialValues: {
            item_name: '',
            description: '',
            location: '',
            found_at: '',
            image_url: [],  // Store images in an array
            category: '',
            brand: '',
            status: 'unclaimed',
        },
        validationSchema: Yup.object({
            item_name: Yup.string().required('Item name is required'),
            description: Yup.string().required('Description is required'),
            location: Yup.string().required('Location is required'),
            found_at: Yup.string().required('Found date and time is required'),
            category: Yup.string().required('Category is required'),
            brand: Yup.string(),
            status: Yup.string().oneOf(['unclaimed', 'claimed'], 'Invalid status').required('Status is required'),
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                    if (key === 'image_url') {
                        value.forEach((img) => formData.append('image_url[]', img));
                    } else {
                        formData.append(key, value);
                    }
                });

                // Include uploaded files
                itemFileUploads.forEach((file) => formData.append('images', file));

                console.log('Form data:', formData);

                await put({
                    apiName: 'lostandfound',
                    path: `/item/update/${itemId}`,
                    options: { body: formData }
                });

                enqueueSnackbar('Item updated successfully', { variant: 'success' });
                setEditMode(false);
                handleGetItem();
            } catch (err) {
                enqueueSnackbar('Failed to update item', { variant: 'error' });
            } finally {
                setLoading(false);
            }
        },
    });

    const handleGetItem = async () => {
        try {
            setLoading(true);
            const req = get({ apiName: 'lostandfound', path: `/item/${itemId}` });
            const res = await req.response;
            const data = await res.body.json();
            setItemFileUploads([]);
            const item = data.item;
            const imageUrls = item.image_url ? JSON.parse(item.image_url) : [];

            setItem(item);
            setItemFiles(imageUrls);

            formik.setValues({
                item_name: item.item_name,
                description: item.description,
                location: item.location,
                found_at: new Date(item.found_at).toISOString().substring(0, 16),
                category: item.category,
                brand: item.brand || 'Others',
                status: item.status,
                image_url: imageUrls,
            });

            setError(false);
        } catch (err) {
            console.error('Error fetching item:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (open && itemId) {
            handleGetItem();
        }
    }, [open]);

    const handleChangeItemImage = (e) => {
        const files = Array.from(e.target.files);
        setItemFiles((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
        setItemFileUploads((prev) => [...prev, ...files]);
        enqueueSnackbar('Images uploaded successfully', { variant: 'success' });
    };

    const handleDeleteImage = (index) => {
        setItemFiles((prev) => prev.filter((_, i) => i !== index));
        formik.setFieldValue('image_url', formik.values.image_url.filter((_, i) => i !== index));
        setItemFileUploads((prev) => prev.filter((_, i) => i !== index));
        enqueueSnackbar('Image deleted', { variant: 'info' });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                        <CloseRounded />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6">Item Details</Typography>
                    {!loading && !error && !editMode && (
                        <Button onClick={() => setEditMode(true)} startIcon={<EditRounded />} color="inherit">Edit</Button>
                    )}
                    {editMode && (
                        <>
                            <LoadingButton onClick={formik.handleSubmit} loading={loading} startIcon={<SaveRounded />} color="inherit">
                                Save
                            </LoadingButton>
                            <Button onClick={() => setEditMode(false)} startIcon={<EditOffRounded />} color="inherit" sx={{ ml: '0.5rem' }}>
                                Cancel
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {loading ? (
                <Stack direction="column" spacing={2} my="3rem" alignItems="center">
                    <CircularProgress />
                    <Typography color="grey">Loading item details...</Typography>
                </Stack>
            ) : error ? (
                <Stack direction="column" spacing={2} my="3rem" alignItems="center">
                    <Typography color="grey">Failed to load item details</Typography>
                    <Button onClick={handleGetItem} startIcon={<RefreshRounded />} variant="outlined">Retry</Button>
                </Stack>
            ) : (
                <Box p={3}>
                    {editMode && (
                        <Alert severity="info" sx={{ mb: '1rem' }}>You are in edit mode. Make sure to save your changes.</Alert>
                    )}

                    <Typography variant="h5" fontWeight={700}>
                        {editMode ? (
                            <TextField
                                fullWidth
                                id="item_name"
                                name="item_name"
                                label="Item Name"
                                value={formik.values.item_name}
                                onChange={formik.handleChange}
                                error={formik.touched.item_name && Boolean(formik.errors.item_name)}
                                helperText={formik.touched.item_name && formik.errors.item_name}
                                size="small"
                                variant="outlined"
                            />
                        ) : (
                            item.item_name
                        )}
                    </Typography>
                    <Typography fontSize="0.75rem" color="grey">Created At: {new Date(item.createdAt).toLocaleString()}</Typography>
                    <Divider sx={{ my: '1rem' }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body1" fontWeight={700}>Found Date and Time</Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    id="found_at"
                                    name="found_at"
                                    type="datetime-local"
                                    value={formik.values.found_at}
                                    onChange={formik.handleChange}
                                    error={formik.touched.found_at && Boolean(formik.errors.found_at)}
                                    helperText={formik.touched.found_at && formik.errors.found_at}
                                    size="small"
                                    variant="outlined"
                                />
                            ) : (
                                <Typography>{new Date(item.found_at).toLocaleString()}</Typography>
                            )}
                        </Grid>

                        {/* Category, Brand, Status */}
                        <Grid item xs={6}>
                            <Typography variant="body1" fontWeight={700}>Category</Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    id="category"
                                    name="category"
                                    label="Category"
                                    value={formik.values.category}
                                    onChange={formik.handleChange}
                                    error={formik.touched.category && Boolean(formik.errors.category)}
                                    helperText={formik.touched.category && formik.errors.category}
                                    size="small"
                                    variant="outlined"
                                />
                            ) : (
                                <Chip label={item.category} color="primary" />
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1" fontWeight={700}>Brand</Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    id="brand"
                                    name="brand"
                                    label="Brand"
                                    value={formik.values.brand}
                                    onChange={formik.handleChange}
                                    size="small"
                                    variant="outlined"
                                />
                            ) : (
                                <Typography>{item.brand || 'N/A'}</Typography>
                            )}
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1" fontWeight={700}>Status</Typography>
                            {editMode ? (
                                <TextField
                                    fullWidth
                                    id="status"
                                    name="status"
                                    select
                                    label="Status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                    size="small"
                                    variant="outlined"
                                >
                                    <MenuItem value="unclaimed">Unclaimed</MenuItem>
                                    <MenuItem value="claimed">Claimed</MenuItem>
                                </TextField>
                            ) : (
                                <Chip label={item.status} color={item.status === 'claimed' ? 'success' : 'warning'} />
                            )}
                        </Grid>

                        {/* Images Section */}
                        <Grid item xs={12}>
                            <Typography variant="body1" fontWeight={700}>Images</Typography>
                            {editMode ? (
                                <>
                                    <Button variant="contained" component="label">Upload Images
                                        <input hidden accept="image/*" onChange={handleChangeItemImage} multiple type="file" />
                                    </Button>
                                    <Grid container spacing={2} mt={2}>
                                        {itemFiles.map((file, index) => (
                                            <Grid item xs={4} key={index}>
                                                <Card>
                                                    <CardMedia component="img" image={file} alt="Item image" />
                                                    <IconButton onClick={() => handleDeleteImage(index)}>
                                                        <Delete />
                                                    </IconButton>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </>
                            ) : (
                                <Grid container spacing={2}>
                                    {itemFiles.map((url, index) => (
                                        <Grid item xs={4} key={index}>
                                            <Card>
                                                <CardMedia component="img" image={url} alt="Item image" />
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Dialog>
    );
}
