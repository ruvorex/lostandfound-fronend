import React, { useState } from 'react';
import { TextField, IconButton, InputAdornment, Button, useMediaQuery } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

export default function SearchBar({ onSearch }) {
    const [searchValue, setSearchValue] = useState("");
    const isMobile = useMediaQuery('(max-width:600px)');

    const handleClear = () => {
        setSearchValue("");
        onSearch(""); 
    };

    const handleSearch = () => {
        onSearch(searchValue); 
    };

    return (
        <TextField
            fullWidth
            variant="outlined"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for Items"
            InputProps={{
                startAdornment: !isMobile ? (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ) : null,
                endAdornment: (
                    <>
                        {searchValue.length > 1 && (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClear}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )}
                        <InputAdornment position="end">
                            {!isMobile ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSearch}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: "50px",
                                        padding: "0.3rem 1rem",
                                        backgroundColor: "#004aad",
                                        "&:hover": {
                                            backgroundColor: "#003a80",
                                        },
                                        fontWeight: "bold",
                                    }}
                                >
                                    Search
                                </Button>
                            ) : (
                                <IconButton onClick={handleSearch} sx={{ color: "#004aad" }}>
                                    <SearchIcon />
                                </IconButton>
                            )}
                        </InputAdornment>
                    </>
                ),
            }}
            sx={{
                "& .MuiOutlinedInput-root": {
                    border: "none",
                    borderRadius: "50px",
                    backgroundColor: "#fff",
                },
            }}
        />
    );
}
