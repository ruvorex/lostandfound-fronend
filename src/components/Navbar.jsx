import { AppBar, Toolbar, Box, Divider } from "@mui/material";
import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <AppBar position="sticky" sx={{ backgroundColor: "#ffffff" }}>
            <Toolbar sx={{ paddingTop: "16px", paddingBottom: "16px" }}>
                <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", paddingLeft: "32px", paddingRight: "32px" }}>
                    {/* Logo Section */}
                    <Box sx={{ flexGrow: 1, display: ["none", "none", "flex"], alignItems: "center" }}>
                        <Link to="/">
                            <img
                                src="/logo-nyp.svg"
                                alt="NYP Logo"
                                style={{ width: "auto", height: "32px" }}
                            />
                        </Link>
                        <Divider orientation="vertical" flexItem sx={{ mx: "1rem" }} />
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
