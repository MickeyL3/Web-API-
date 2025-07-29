import axios from 'axios';
import * as React from 'react';
import {
    Paper,
    Button,
    Typography,
    AppBar,
    Toolbar,
    IconButton,
    Box,
    Container,
    Avatar
} from "@mui/material";
import GameListObject from "./GameListObject";
import { useGameStore } from "../store";
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import {Link, useNavigate} from "react-router-dom";


const FreeGames = () => {
    const games = useGameStore((state) => state.games);
    const game = games.length > 0 ? games[0] : null;
    const setGames = useGameStore((state) => state.setGames);
    const pageSize = 10;
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isLoginSuccess, setIsLoginSuccess] = React.useState(false);
    const [logoutTriggered, setLogoutTriggered] = React.useState(false);
    const authToken = localStorage.getItem('authToken');
    const [creatorImage, setCreatorImage] = React.useState('');
    const [userImage, setUserImage] = React.useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        if (authToken) {
            setIsLoginSuccess(true);
        }
    }, []);

    React.useEffect(() => {
        const getFreeGames = () => {
            const queryParams = new URLSearchParams();
            queryParams.append("price", "0");
            axios
                .get(`http://localhost:4941/api/v1/games?${queryParams.toString()}`)
                .then((response) => {
                    setGames(response.data.games);
                })
                .catch((err) => {
                    console.error("Error fetching games:", err);
                });
        };
        getFreeGames();
    }, []);

    React.useEffect(() => {
        const handleLogout = () => {
            if (!logoutTriggered) return;
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
                    setIsLoginSuccess(false);
                    navigate("/listgames");
                })
                .catch((err) => {
                    console.error("Logout error:", err.response || err);
                })
            setLogoutTriggered(false);
        };
        handleLogout();
    }, [logoutTriggered]);

    const paginatedGames = games.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

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
                        <SportsEsportsIcon onClick={() => navigate("/listgames")}
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
                            {isLoginSuccess && (
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
                            {!isLoginSuccess && (
                                <Button color="inherit" component={Link} to="/listgames/freegames">
                                    Free Games
                                </Button>
                            )}
                        </Box>
                        {/*Avatar and user menu */}
                        <Box sx={{ flexGrow: 0, alignItems: 'flex-end' }}>
                            <IconButton sx={{ p: 5 }} onClick={() => navigate('/users/viewprofile')}>
                            <Avatar
                                    src={isLoginSuccess && userImage ? userImage : "https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png"}
                                    sx={{ width: 56, height: 56 }}
                                />
                            </IconButton>

                            {!isLoginSuccess ? (
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
                                    <Button color="inherit" component={Link} to="/users/creategame">
                                        Create Games
                                    </Button>
                                </>
                            )}
                        </Box>

                    </Toolbar>
                </Container>
            </AppBar>
                {/* Main content */}
                <Paper elevation={3} sx={{ width: '100%', mt: 2, p: 2 }}>
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
                    </Box>
                </Paper>
            </Box>
        );
    }

export default FreeGames;
