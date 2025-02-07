import React, { useEffect } from 'react'
import { useState } from 'react'
import { Typography, Stack, IconButton, Button, Menu, ListItem, MenuItem, ListItemIcon, Divider, ListItemText } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { SettingsRounded, AddRounded, InfoRounded, GroupRounded, PersonAddRounded, FlagRounded, CategoryRounded, HomeRounded } from '@mui/icons-material';

export default function StaffMenu(props) {
    const navigate = useNavigate()
    const [isFarmMenuOpen, setIsFarmMenuOpen] = useState(false)
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false)
    const [navbarAnchorEl, setNavbarAnchorEl] = useState(null)

    const menuSlotProps = {
        paper: {
            elevation: 0,
            sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 0.5,
                '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                },
                '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: 24,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                },
            },
        },
    }

    const handleFarmClick = (event) => {
        setNavbarAnchorEl(event.currentTarget)
        setIsFarmMenuOpen(true)
    }

    const handleSettingsClick = (event) => {
        setNavbarAnchorEl(event.currentTarget)
        setIsSettingsMenuOpen(true)
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            // if (event.shiftKey) {
            //     switch (event.key) {
            //         case "F":
            //             navigate("/staff/farms")
            //             break;
            //         case "P":
            //             navigate("/staff/plots")
            //             break;
            //         case "D":
            //             navigate("/devices")
            //             break;
            //         case "O":
            //             navigate("/staff")
            //             break;
            //         case "T":
            //             navigate("/tasks")
            //             break;
            //         case "M":
            //             navigate("/farms/map")
            //             break;
            //         default:
            //             break;
            //     }
            // }
        }

        const handleResize = () => {
            if (window.innerWidth < 600) {
                setIsFarmMenuOpen(false)
                setIsSettingsMenuOpen(false)
            }
        }

        // Add event listener for keydown
        window.addEventListener("keydown", handleKeyDown);

        // Add event listener for window resize
        window.addEventListener("resize", handleResize);
    }, [])



    return (
        <>
            <Stack direction="row" spacing={1}>
                <Button sx={{ fontWeight: 700 }} startIcon={<CategoryRounded />} variant="text" color="inherit" onClick={handleFarmClick}>Items</Button>
            </Stack>
            <Menu
                anchorEl={navbarAnchorEl}
                open={isFarmMenuOpen}
                onClose={() => setIsFarmMenuOpen(false)}
                onClick={() => setIsFarmMenuOpen(false)}
                slotProps={menuSlotProps}
            >
                <MenuItem onClick={() => navigate("/staff")}>
                    <ListItemIcon>
                        <HomeRounded />
                    </ListItemIcon>
                    <ListItemText primary="Home Dashboard" sx={{marginRight: "2rem"}} />
                </MenuItem>
                <Divider />
                
                <MenuItem onClick={() => navigate("/staff/addItem")}>
                    <ListItemIcon>
                        <AddRounded />
                    </ListItemIcon>
                    <ListItemText primary="Add Found Item" />
                </MenuItem>
            </Menu>
            {/* <Menu
                anchorEl={navbarAnchorEl}
                open={isSettingsMenuOpen}
                onClose={() => setIsSettingsMenuOpen(false)}
                onClick={() => setIsSettingsMenuOpen(false)}
                slotProps={menuSlotProps}
            >
                <MenuItem onClick={() => navigate("/staff/users")}>
                    <ListItemIcon>
                        <GroupRounded />
                    </ListItemIcon>
                    <ListItemText primary="Manage Users" sx={{marginRight: "2rem"}} />
                    <Typography variant="caption" color="text.secondary">Ctrl + Alt + U</Typography>
                </MenuItem>
                <MenuItem onClick={() => navigate("/staff/users/create")}>
                    <ListItemIcon>
                        <PersonAddRounded />
                    </ListItemIcon>
                    <ListItemText primary="New User..." />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate("/about")}>
                    <ListItemIcon>
                        <InfoRounded />
                    </ListItemIcon>
                    <ListItemText primary="About ReclaimIt" />
                </MenuItem>
            </Menu> */}
        </>

    )
}