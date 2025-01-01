import { Container, Typography, Divider, Button } from '@mui/material';
import { LoginRounded } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <Container sx={{ mt: "1rem" }} maxWidth="xl">
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Welcome to MidoriSKY
            </Typography>
            <Divider sx={{ my: "1rem" }} />
            <Typography variant="h6">Temporary Homepage... More to come soon</Typography>
            <br />
            <Button variant="contained" color="primary" startIcon={<LoginRounded />} component={Link} to="/login">
                Login
            </Button>
        </Container>
    );
}

export default Home;
