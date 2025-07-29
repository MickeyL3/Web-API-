import axios from 'axios';
import * as React from 'react';
import {
    Paper,
    AlertTitle,
    Alert,
    Button,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    MenuItem,
    Box, Container, Avatar, TextField, InputAdornment, Autocomplete
} from "@mui/material";
import GameListObject from "./GameListObject";
import { useGameStore } from "../store";
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import {Link, useNavigate} from "react-router-dom";
import SearchIcon from '@mui/icons-material/Search';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

const GameList = () => {
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const games = useGameStore((state) => state.games);
    const game = games.length > 0 ? games[0] : null;
    const setGames = useGameStore((state) => state.setGames);
    const pageSize = 10;
    const totalPages = Math.ceil(games.length / pageSize);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [searchGame, setSearchGame] = React.useState("");
    const [selectedGenres, setSelectedGenres] = React.useState<number[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = React.useState<number[]>([]);
    const [logoutTriggered, setLogoutTriggered] = React.useState(false);
    const navigate = useNavigate();
    let authToken = localStorage.getItem('authToken');
    const [maxPrice, setMaxPrice] = React.useState<number | null>(null);
    const [creatorImage, setCreatorImage] = React.useState('');
    const [userImage, setUserImage] = React.useState('');
    const [sortOrder, setSortOrder] = React.useState("CREATED_ASC");

    const ITEM_HEIGHT = 48
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };
    const genres = [
        { id: 1, name: 'Action' },
        { id: 2, name: 'Adventure' },
        { id: 3, name: 'RPG' },
        { id: 4, name: 'Puzzle' },
        { id: 5, name: 'Simulation' },
        { id: 6, name: 'Strategy' },
        { id: 7, name: 'Sports' },
        { id: 8, name: 'Horror' },
        { id: 9, name: 'Racing' },
        { id: 10, name: 'Fighting' }
    ];

    const platforms = [
        { id: 1, name: 'PC' },
        { id: 2, name: 'Xbox' },
        { id: 3, name: 'Playstation 5' },
        { id: 4, name: 'Nintendo Switch' },
        { id: 5, name: 'Mobile' }
    ];

    React.useEffect(() => {
        authToken = localStorage.getItem('authToken');
    }, [localStorage]);

    const handleGenresChange = (event: SelectChangeEvent<number[]>) => {
        const value = event.target.value;
        setSelectedGenres(typeof value === 'string' ? value.split(',').map(Number) : value);
    };

    const handlePlatformsChange = (event: SelectChangeEvent<number[]>) => {
        const value = event.target.value;
        setSelectedPlatforms(typeof value === 'string' ? value.split(',').map(Number) : value);
    };


    const handleSortOrderChange = (event: SelectChangeEvent<string>) => {
        setSortOrder(event.target.value);
    };

    const handleApplyFilters = () => {
        const queryParams = new URLSearchParams();

        if (searchGame) {
            queryParams.append("search", searchGame);
        }

        selectedGenres.forEach((id) => {
            queryParams.append("genreIds", id.toString());
        });

        selectedPlatforms.forEach((id) => {
            queryParams.append("platformIds", id.toString());
        });

        if (maxPrice !== null && maxPrice >= 0) {
            queryParams.append("price", Math.round(maxPrice * 100).toString());
        }

        console.log("Query String:", queryParams.toString());

        if (sortOrder) {
            queryParams.append("sortBy", sortOrder);
        }

        axios.get(`http://localhost:4941/api/v1/games?${queryParams.toString()}`)
            .then((response) => {
                setGames(response.data.games);
            })
            .catch((err) => {
                console.error("Error fetching games:", err);
            });
    };

    React.useEffect(() => {
        const handleLogout = () => {
            if (!logoutTriggered) return;
            authToken = localStorage.getItem('authToken');
            axios.post(
                "http://localhost:4941/api/v1/users/logout",
                null,
                { headers: {
                    'X-Authorization': authToken
                    }
                })
                .then(response => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                    // setIsLoginSuccess(false);
                    navigate("/listgames");
                })
                .catch((err) => {
                    console.error("Logout error:", err.response || err);
                })
            setLogoutTriggered(false);
        };
        handleLogout();
    }, [logoutTriggered]);

    const sortOptions = [
    { label: "Game Name A-Z", value: "ALPHABETICAL_ASC" },
    { label: "Game Name Z-A", value: "ALPHABETICAL_DESC" },
    { label: "Price Low To High", value: "PRICE_ASC" },
    { label: "Price High To Low", value: "PRICE_DESC" },
    { label: "Rating Low To High ", value: "RATING_ASC" },
    { label: "Rating High To Low", value: "RATING_DESC" },
    { label: "Oldest To Newest", value: "CREATED_ASC" },
    { label: "Newest To Oldest", value: "CREATED_DESC" },
    ];

    const handlePageChange = (pageChange: () => void) => {
        window.scrollTo(0, 0);
        pageChange();
    };

    React.useEffect(() => {
        const searchGames = async () => {
            try {
                const response = await axios.get('http://localhost:4941/api/v1/games/', {
                    params: {
                        q: searchGame || undefined,
                        count: 22,
                        startIndex: 0
                    }
                });
                setGames(response.data.games);
            } catch (err) {
                console.error("Failed to fetch games", err);
            }
        };

        searchGames();
    }, [searchGame]);


    const paginatedGames = games.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );



    const handleFirst = () => setCurrentPage(1);
    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };
    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };
    const handleLast = () => setCurrentPage(totalPages);

    React.useEffect(() => {
        const getGames = () => {
            axios.get('http://localhost:4941/api/v1/games/')
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setGames(response.data["games"]);
                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(
                        error.toString() +
                        " defaulting to old games — changes in the app may not work as expected"
                    );
                });
        };
        getGames();
    }, [setGames]);

    React.useEffect(() => {
        console.log(creatorImage);
        const getCreatorImage = () => {
            axios
                .get(`http://localhost:4941/api/v1/users/${game?.creatorId}/image`, {
                    responseType: 'blob',
                })
                .then((response) => {
                    const imgURL = URL.createObjectURL(response.data);
                    setCreatorImage(imgURL);
                })
                .catch((error) => {
                    setCreatorImage('');
                    if (axios.isAxiosError(error) && error.response?.status !== 404) {
                        console.error(`Failed to load image for user ${game?.creatorId}`, error);
                    }
                });
        };
        getCreatorImage();
    }, [game?.creatorId, setCreatorImage]);

    React.useEffect(() => {
        const getUserImage = () => {
            axios
                .get(`http://localhost:4941/api/v1/users/${localStorage.getItem('userId')}/image`, {
                    responseType: 'blob',
                })
                .then((response) => {
                    const imgURL = URL.createObjectURL(response.data);
                    setUserImage(imgURL);
                })
                .catch((error) => {
                    setUserImage('');
                    if (axios.isAxiosError(error) && error.response?.status !== 404) {
                        console.error(`Failed to load image for user ${game?.creatorId}`, error);
                    }
                });
        };
        getUserImage();
    }, [localStorage.getItem('userId'), setUserImage]);

    React.useEffect(() => {

        const sortGame = () => {
            axios
                .get(`http://localhost:4941/api/v1/games?sortBy=${sortOrder}`)
                .then((response) => {
                    setGames(response.data.games);
                    setErrorFlag(false);
                    setErrorMessage("");
                })
                .catch((err) => {
                    setErrorFlag(true);
                    setErrorMessage("Error fetching sorted games: " + err);
                });
        };
        sortGame();
    }, [sortOrder]);

    const game_rows = () =>
        paginatedGames.map((row: Game) => (
            <GameListObject key={row.gameId + row.title}
                            game={row}
            />

        ));

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Logo - Desktop */}
                        <SportsEsportsIcon onClick={() => handlePageChange(handleFirst)}
                                           sx={{
                                               display: { xs: 'none', md: 'flex' },
                                               fontSize: 80,
                                               ml: -10,
                                               mr: 1,
                                               cursor: 'pointer',
                                               color: 'inherit'
                                           }} />

                        {/* Nav buttons - Desktop */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {authToken && (
                                <>
                                    <Button color="inherit" component={Link} to="/listgames/freegames">
                                        Free Games
                                    </Button>
                                    <Button color="inherit" component={Link} to="/users/viewownedgames">
                                        Own
                                    </Button>
                                    <Button color="inherit" component={Link} to="/users/viewwishlistgames">
                                        Wishlist
                                    </Button>
                                    <Button color="inherit" component={Link} to="/users/viewreviewgames">
                                        Review
                                    </Button>
                                    <Button color="inherit" component={Link} to="/users/viewcreategames">
                                        Created Games
                                    </Button>
                                </>
                            )}
                            {!authToken && (
                                <Button color="inherit" component={Link} to="/listgames/freegames">
                                    Free Games
                                </Button>
                            )}

                        </Box>


                        {/* Search bar */}
                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <TextField
                                placeholder="I'm looking for..."
                                variant="filled"
                                fullWidth
                                value={searchGame}
                                onChange={(e) => {
                                    setSearchGame(e.target.value);
                                    setCurrentPage(1);
                                }}
                                sx={{ width: 250 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                        </Box>


                         {/*Avatar and user menu */}
                        <Box sx={{ flexGrow: 0, alignItems: 'flex-end' }}>
                            <IconButton sx={{ p: 5 }} onClick={() => navigate('/users/viewprofile')}>
                                <Avatar
                                    src={authToken && userImage ? userImage : "https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png"}
                                    sx={{ width: 56, height: 56 }}
                                />
                            </IconButton>
                            {!authToken ? (
                                <>
                                    <Button color="inherit" component={Link} to="/users/login">Login</Button>
                                    <Button color="inherit" component={Link} to="/users/register">Register</Button>
                                </>
                            ) : (
                                <>
                                    <Button color="inherit" component={Link} to="/users/viewprofile">Profile</Button>
                                    <Button
                                        color="inherit"
                                        onClick={() => setLogoutTriggered(true)}
                                    >
                                        Logout
                                    </Button>
                                    <Button color="inherit" component={Link} to="/users/creategame">Create Games</Button>

                                </>
                            )}
                        </Box>

                    </Toolbar>
                </Container>
            </AppBar>
            {/*{renderMenu}*/}
            <Container maxWidth="xl" sx={{ mt: 3 }}>
                {/* Filter Controls */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {/* Sort Dropdown */}
                    <FormControl sx={{ width: 200 }}>
                        <InputLabel id="sort-select-label">Sort By</InputLabel>
                        <Select
                            labelId="sort-select-label"
                            value={sortOrder}
                            onChange={handleSortOrderChange}
                            input={<OutlinedInput label="Sort By" />}
                        >
                            {sortOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {/* Genre Filter */}
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="genre-select-label">Genre</InputLabel>
                        <Select
                            labelId="genre-select-label"
                            multiple
                            value={selectedGenres}
                            onChange={handleGenresChange}
                            input={<OutlinedInput label="Genre" />}
                            renderValue={(selected) =>
                                genres
                                    .filter((genre) => selected.includes(genre.id))
                                    .map((genre) => genre.name)
                                    .join(', ')
                            }
                            MenuProps={MenuProps}
                        >
                            {genres.map((genre) => (
                                <MenuItem key={genre.id} value={genre.id}>
                                    <Checkbox checked={selectedGenres.includes(genre.id)} />
                                    <ListItemText primary={genre.name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Platform Filter */}
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="platform-select-label">Platform</InputLabel>
                        <Select
                            labelId="platform-select-label"
                            multiple
                            value={selectedPlatforms}
                            onChange={handlePlatformsChange}
                            input={<OutlinedInput label="Platform" />}
                            renderValue={(selected) =>
                                platforms
                                    .filter((platform) => selected.includes(platform.id))
                                    .map((platform) => platform.name)
                                    .join(', ')
                            }
                            MenuProps={MenuProps}
                        >
                            {platforms.map((platform) => (
                                <MenuItem key={platform.id} value={platform.id}>
                                    <Checkbox checked={selectedPlatforms.includes(platform.id)} />
                                    <ListItemText primary={platform.name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Price Filter */}
                    <TextField
                        label="Max Price"
                        variant="outlined"
                        type="number"
                        value={maxPrice !== null ? maxPrice.toString() : ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            console.log("Max Price selected:", value);
                            if (value === '') {
                                setMaxPrice(null);
                            } else {
                                const num = Number(value);
                                if (!isNaN(num) && num >= 0) {
                                    setMaxPrice(num);
                                }
                            }
                        }}
                        inputProps={{ step: 0.01 }}
                        sx={{ minWidth: 150 }}
                    />

                    {/* Apply Filters Button */}
                    <Button variant="contained" onClick={handleApplyFilters} sx={{ alignSelf: 'center', height: 56 }}>
                        Apply Filters
                    </Button>


                </Box>
            </Container>


            {/* Main content */}
            <Paper elevation={3} sx={{ width: '100%', mt: 2, p: 2 }}>
                {errorFlag && (
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>
                )}

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        height: "100vh",
                        paddingBottom: "20px",
                    }}
                >

                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "20px",
                            justifyContent: "left",
                            width: "100%",
                            flex: 1,
                        }}
                    >
                        {games.length > 0 ? (
                            game_rows()
                        ) : (
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                No games available.
                            </Typography>
                        )}
                    </Box>

                    {/* Pagination buttons */}
                    {games.length > 0 && (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 1,
                                marginTop: "auto",
                                paddingBottom: "20px",
                            }}
                        >
                            <Button
                                onClick={() => handlePageChange(handleFirst)}
                                disabled={currentPage === 1}
                            >
                                First
                            </Button>
                            <Button
                                onClick={() => handlePageChange(handlePrev)}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </Button>
                            <Typography variant="body1" sx={{ alignSelf: "center" }}>
                                Page {currentPage} of {totalPages}
                            </Typography>
                            <Button
                                onClick={() => handlePageChange(handleNext)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                            <Button
                                onClick={() => handlePageChange(handleLast)}
                                disabled={currentPage === totalPages}
                            >
                                Last
                            </Button>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
export default GameList;