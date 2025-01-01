import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <Box sx={{ textAlign: "center", py: 2 }}>
            <Container maxWidth="xl">
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    NYP - Lost and Found System
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    <Link to="/about" style={{ textDecoration: "none", color: "inherit" }}>
                        Lost and Found 2025 - Samuel
                    </Link>
                </Typography>
            </Container>
        </Box>
    );
}

export default Footer;
