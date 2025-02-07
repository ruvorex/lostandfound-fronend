import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { useSnackbar } from 'notistack';
import { Card, CardContent, Grid, Typography, ButtonBase, Stack, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { AssignmentLateRounded, AppsRounded, RefreshRounded, AddRounded, FlagRounded, VisibilityRounded, DeleteRounded, CheckCircleOutlineRounded, UndoRounded } from '@mui/icons-material';
import CardTitle from '../../components/CardTitle';
import { LayoutContext } from './AdminRoutes';
import { get, put, del } from 'aws-amplify/api';
import { LoadingButton } from '@mui/lab';
import { DataGrid, GridActionsCellItem, GridToolbarExport } from '@mui/x-data-grid';
import ItemDialog from '../../components/ItemDialog';

const useStyles = makeStyles(() => ({
    outerDiv: {
        '&:hover': {
            "& $divIcon": {
                opacity: "0.15",
                bottom: "-28px",
                right: "-28px",
                rotate: "-15deg"
            }
        }
    },
    divIcon: {
        opacity: "0",
        transitionDuration: "1s"
    }
}));

export default function AdminHome() {
    const { setAdminPage, user } = useContext(AppContext);
    const { setContainerWidth } = useContext(LayoutContext);
    const { enqueueSnackbar } = useSnackbar();
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [detailsId, setDetailsId] = useState(null);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [claimDialogOpen, setClaimDialogOpen] = useState(false);
    const [unclaimDialogOpen, setUnclaimDialogOpen] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const customToolbar = () => <GridToolbarExport />;

    const columns = [
        { field: 'id', headerName: 'ID', width: 70, headerClassName: 'bold-header' },
        { field: 'item_name', headerName: 'Item Name', width: 200, headerClassName: 'bold-header' },
        { field: 'location', headerName: 'Location', width: 150, headerClassName: 'bold-header' },
        {
            field: 'found_at',
            headerName: 'Date & Time Found',
            width: 200,
            headerClassName: 'bold-header',
            renderCell: (params) => {
                const date = new Date(params.value);
                return !isNaN(date) ? date.toLocaleString() : 'Invalid Date';
            }
        },
        { field: 'category', headerName: 'Category', width: 150, headerClassName: 'bold-header' },
        { field: 'brand', headerName: 'Brand', width: 150, headerClassName: 'bold-header' },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            headerClassName: 'bold-header',
            renderCell: (params) => (
                <Chip
                    label={params.value === 'claimed' ? "Claimed" : "Unclaimed"}
                    color={params.value === 'claimed' ? 'success' : 'warning'}
                    size="small"
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 300,
            headerClassName: 'bold-header',
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VisibilityRounded />}
                        onClick={() => {
                            setDetailsId(params.row.id);
                            setDetailsDialogOpen(true);
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        View
                    </Button>
                    {params.row.status === 'unclaimed' ? (
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleOutlineRounded />}
                            onClick={() => {
                                setDetailsId(params.row.id);
                                setClaimDialogOpen(true);
                            }}
                            sx={{ textTransform: 'none' }}
                        >
                            Claim
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            startIcon={<UndoRounded />}
                            onClick={() => {
                                setDetailsId(params.row.id);
                                setUnclaimDialogOpen(true);
                            }}
                            sx={{ textTransform: 'none' }}
                        >
                            Unclaim
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<DeleteRounded />}
                        onClick={() => {
                            setDeleteDialogOpen(true);
                            setDetailsId(params.row.id);
                        }}
                        sx={{ textTransform: 'none' }}
                    >
                        Delete
                    </Button>
                </Stack>
            ),
        },
    ];

    const handleDetailsClose = () => {
        setDetailsDialogOpen(false);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
    };

    const handleClaimDialogClose = () => {
        setClaimDialogOpen(false);
    };

    const handleUnclaimDialogClose = () => {
        setUnclaimDialogOpen(false);
    };

    const handleGetItems = async () => {
        setItemsLoading(true);
        try {
            const req = get({
                apiName: 'lostandfound',
                path: '/items',
            });
            const res = await req.response;
            const data = await res.body.json();
            console.log(data.items)
            setItems(data.items);
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Failed to fetch items', { variant: 'error' });
        } finally {
            setItemsLoading(false);
        }
    };

    const handleClaimItem = async () => {
        setClaimLoading(true);
        try {
            await put({
                apiName: 'lostandfound',
                path: `/item/claim/${detailsId}`,
            });
            enqueueSnackbar('Item claimed successfully', { variant: 'success' });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await handleGetItems();
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Failed to claim item', { variant: 'error' });
        } finally {
            setClaimLoading(false);
            setClaimDialogOpen(false);
        }
    };

    const handleUnclaimItem = async () => {
        setClaimLoading(true);
        try {
            await put({
                apiName: 'lostandfound',
                path: `/item/unclaim/${detailsId}`,
            });
            enqueueSnackbar('Item marked as unclaimed', { variant: 'success' });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await handleGetItems();
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Failed to unclaim item', { variant: 'error' });
        } finally {
            setClaimLoading(false);
            setUnclaimDialogOpen(false);
        }
    };

    const handleDeleteItem = async () => {
        setDeleteLoading(true);
        try {
            await del({
                apiName: 'lostandfound',
                path: `/item/delete/${detailsId}`,
            });
            enqueueSnackbar('Item deleted successfully', { variant: 'success' });
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await handleGetItems();
        } catch (err) {
            console.error(err);
            enqueueSnackbar('Failed to delete item', { variant: 'error' });
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    useEffect(() => {
        setContainerWidth('xl');
        setAdminPage(true);
        handleGetItems();
    }, []);

    return (
        <>
            <Box my={'1rem'}>
                <Card>
                    <CardContent>
                        <CardTitle title="Staff Shortcuts" icon={<AppsRounded />} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <ButtonBase component={Link} to="/" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <FlagRounded sx={{ fontSize: 36 }} />
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700}>View Items</Typography>
                                                    <Typography variant="body2">Manage Lost & Found Items</Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card variant="outlined">
                                    <ButtonBase component={Link} to="/staff/addItem" sx={{ width: "100%", justifyContent: 'start' }}>
                                        <CardContent sx={{ color: "primary.main" }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <AddRounded sx={{ fontSize: 36 }} />
                                                <Box>
                                                    <Typography variant="h6" fontWeight={700}>Create Item</Typography>
                                                    <Typography variant="body2">Create a Found Item</Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </ButtonBase>
                                </Card>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Grid container spacing={2} mt={1}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <CardTitle title="Items Found" icon={<AssignmentLateRounded />} />
                                    <LoadingButton onClick={handleGetItems} loading={itemsLoading} variant="text" startIcon={<RefreshRounded />} size="small">
                                        Refresh
                                    </LoadingButton>
                                </Box>
                                <DataGrid
                                    rows={items}
                                    columns={columns}
                                    pageSize={10}
                                    loading={itemsLoading}
                                    autoHeight
                                    slots={{ toolbar: customToolbar }}
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <ItemDialog
                open={detailsDialogOpen}
                onClose={handleDetailsClose}
                itemId={detailsId}
                onUpdate={handleGetItems}
                guestMode={false}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
                <DialogTitle>Delete Item</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this item? This action cannot be undone.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose} color="primary">
                        Cancel
                    </Button>
                    <LoadingButton onClick={handleDeleteItem} loading={deleteLoading} color="error" autoFocus>
                        Delete
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            {/* Claim Confirmation Dialog */}
            <Dialog open={claimDialogOpen} onClose={handleClaimDialogClose}>
                <DialogTitle>Claim Item</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to mark this item as claimed?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClaimDialogClose} color="primary">
                        Cancel
                    </Button>
                    <LoadingButton onClick={handleClaimItem} loading={claimLoading} color="success" autoFocus>
                        Claim
                    </LoadingButton>
                </DialogActions>
            </Dialog>

            {/* Unclaim Confirmation Dialog */}
            <Dialog open={unclaimDialogOpen} onClose={handleUnclaimDialogClose}>
                <DialogTitle>Unclaim Item</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to mark this item as unclaimed?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleUnclaimDialogClose} color="primary">
                        Cancel
                    </Button>
                    <LoadingButton onClick={handleUnclaimItem} loading={claimLoading} color="warning" autoFocus>
                        Unclaim
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
}
