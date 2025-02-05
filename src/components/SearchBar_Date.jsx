import React, { useState } from 'react';
import { TextField, IconButton, InputAdornment, Button, Box, Divider } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function SearchBarDate({ onSearch }) {
    const [searchValue, setSearchValue] = useState("");
    const [searchDate, setSearchDate] = useState(null);

    const handleClear = () => {
        setSearchValue("");
        setSearchDate(null);
        onSearch("", null);
    };

    const handleSearch = () => {
        onSearch(searchValue, searchDate);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f9f9f9',
                borderRadius: '50px',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
                transition: 'border-color 0.3s, box-shadow 0.3s',
                border: '1px solid #ddd',
                '&:hover': {
                    boxShadow: '0 0 4px #004aad',
                },
                '&:focus-within': {
                    borderColor: '#004aad',
                    boxShadow: '0 0 4px #004aad',
                },
            }}
        >
            {/* Search Bar */}
            <TextField
                fullWidth
                variant="outlined"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="What have you lost?"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        searchValue.length > 0 && (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClear}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    ),
                    sx: {
                        border: 'none',
                        backgroundColor: 'transparent',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'transparent',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'transparent',
                        },
                    },
                }}
                sx={{
                    flex: 3,
                    '& .MuiOutlinedInput-root': {
                        border: 'none',
                        backgroundColor: 'transparent',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'transparent',
                            border: 'none',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'transparent',
                            border: 'none',
                        },
                    },
                }}
            />

            {/* Divider */}
            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: '#ddd' }} />

            {/* Date Picker */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label=""
                    value={searchDate}
                    onChange={(date) => setSearchDate(date)}
                    InputAdornmentProps={{ position: 'start' }}
                    slotProps={{
                        textField: {
                            placeholder: 'Select Date',
                            InputProps: {
                                disableUnderline: true,
                            },
                            sx: {
                                padding: '8px',
                                '& .MuiOutlinedInput-root': {
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'transparent',
                                        border: 'none',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'transparent',
                                        border: 'none',
                                    },
                                },
                            },
                        },
                        inputAdornment: {
                            position: 'start',
                        },
                    }}
                />
            </LocalizationProvider>

            {/* Clear Date Button */}
            {searchDate && (
                <IconButton onClick={() => handleClear()}>
                    <ClearIcon />
                </IconButton>
            )}

            {/* Search Button */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                sx={{
                    textTransform: 'none',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    backgroundColor: '#004aad',
                    '&:hover': {
                        backgroundColor: '#003a80',
                    },
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    marginRight: '8px',
                }}
            >
                Search
            </Button>
        </Box>
    );
}