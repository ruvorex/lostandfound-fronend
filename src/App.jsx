import React, { useState, createContext, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Box } from '@mui/material';
import UserRoutes from './pages/UserRoute';

export const AppContext = createContext(null);

function App() {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    useEffect(() => {
        // Placeholder for user initialization logic
        setUserLoading(false);
    }, []);

    return (
        <AppContext.Provider value={{ user, setUser, userLoading, setUserLoading }}>
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: "100%" }}>
                <Navbar />
                <Box sx={{ flexGrow: 1 }}>
                    <Routes location={location}>
                        <Route path="*" element={<UserRoutes />} />
                    </Routes>
                </Box>
                <Footer />
            </Box>
        </AppContext.Provider>
    );
}

export default App;
