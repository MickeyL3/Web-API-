import axios from 'axios';
import React, {useState} from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    TextField,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Typography,
    Box,
    Rating,
    Stack,
    Avatar,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    InputLabel,
    Select, MenuItem, Checkbox, AppBar, Container, Toolbar, InputAdornment, IconButton, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import * as CSS from "csstype";
import {useGameStore} from "../store";
import { Grid } from '@mui/material';
import GameListObject from "./GameListObject";
import {SelectChangeEvent} from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";


const userCardStyles: CSS.Properties = {
    display: "inline-block",
    height: "750px",
    width: "500px",
    margin: "10px",
    padding: "0px"
};

const Game = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const pageSize = 10;
    const [currentPage, setCurrentPage] = React.useState(1);


    const [game, setGame] = React.useState<GameFull>({
        gameId: 0,
        title: '',
        creationDate: '',
        genreId: 0,
        creatorId: 0,
        creatorFirstName: "",
        creatorLastName: "",
        price: 0,
        rating: 0,
        platformIds: [],
        description: "",
        numberOfOwners: 0,
        numberOfWishlists:0,

    });

    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [updatedTitle, setUpdatedTitle] = React.useState("");
    const [originalTitle, setOriginalTitle] = React.useState<string>("");
    const [updatedDescription, setUpdatedDescription] = React.useState("");
    const [updatedGenre, setUpdatedGenre] = React.useState<number>(0);
    const [updatedPrice, setUpdatedPrice] = React.useState<number | null>(null);
    const [updatedPlatforms, setUpdatedPlatforms] = React.useState<number[]>([]);
    const [updatedGameImage, setUpdatedGameImage] = React.useState<File | null>(null);
    const [isLoginSuccess, setIsLoginSuccess] = React.useState(false);
    const [logoutTriggered, setLogoutTriggered] = React.useState(false);
    const setImage = useGameStore((state) => state.setImage);
    const images = useGameStore((state) => state.gameImages);
    const [creatorImage, setCreatorImage] = React.useState('');
    const authToken = localStorage.getItem("authToken");
    const userId = Number(localStorage.getItem("userId"));
    const [createdByMe, setCreatedByMe] = React.useState(false);
    const [isWishlisted, setIsWishlisted] = React.useState(false);
    const [isOwned, setIsOwned] = React.useState(false);
    const [haveReviewed, setHaveReviewed] = React.useState(false);
    const [updatePage, setUpdatePage] = React.useState(false);
    const [gameGenre, setGameGenre] = React.useState<Genre[]>([]);
    const [gamePlatform, setGamePlatform] = React.useState<Platform[]>([]);
    const [reviews, setReviews] = React.useState<Review[]>([]);
    const [similarGames, setSimilarGames] = React.useState<GameFull[]>([]);
    const [showSimilarGames, setShowSimilarGames] = React.useState(true);
    const [userImage, setUserImage] = React.useState('');
    const [reviewerImages, setReviewerImages] = useState<{ [id: number]: string }>({});
    const defaultUserImage = 'https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png'


    // Dialogs state
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [openEditDialog, setOpenEditDialog] = React.useState(false);
    const [snackbarMessage, setsnackbarMessage] = React.useState("");
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [snackbarType, setSnackbarType] = React.useState<"success" | "error" | "info" | "warning">("success");
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [ratingValue, setRatingValue] = useState(5);

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
        if (authToken) {
            setIsLoginSuccess(true);
        }
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

    // Fetch game on mount
    React.useEffect(() => {
        const getGame = () => {
            axios
                .get(`http://localhost:4941/api/v1/games/${id}`) // Fetch gameFull
                .then((response) => {
                    setGame(response.data);
                    setUpdatedTitle(response.data.title);
                    setOriginalTitle(response.data.title);
                    setUpdatedPrice(response.data.price);
                    setUpdatedDescription(response.data.description);
                    setUpdatedGenre(response.data.genreId);
                    setUpdatedPlatforms(response.data.platformIds);
                    if (userId === response.data.creatorId) {
                        setCreatedByMe(true);
                    }
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
            axios
                .get(`http://localhost:4941/api/v1/games/${id}/reviews`)
                .then((response) => {
                    setReviews(response.data); // Reviews sorted from server
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString()
                    );
                });
            // Check if game is wishlisted by user
            console.log("Checking if game is wishlisted by user");
            axios
                .get(`http://localhost:4941/api/v1/games?wishlistedByMe=true`,
                { headers: {
                        'X-Authorization': authToken
                    }
                })
                .then((response) => {
                    console.log(response.data);
                    response.data.games.forEach(async (game: Game) => {
                        if (game.gameId === Number(id)) setIsWishlisted(true);
                    });
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                })
            // check if game is marked as owned by user
            console.log("Checking if game is owned by user");
            axios
                .get(`http://localhost:4941/api/v1/games?ownedByMe=true`,
                { headers: {
                        'X-Authorization': authToken
                    }
                })
                .then((response) => {
                    console.log(response.data);
                    response.data.games.forEach(async (game: Game) => {
                        if (game.gameId === Number(id)) setIsOwned(true);
                    });
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                })
            setUpdatePage(false);
        };
        getGame();
    }, [id, updatePage]);

    const fetchProfilePicture = async (userId: number) => {
        try {
            const response = await axios.get(`http://localhost:4941/api/v1/users/${userId}/image`, {
                responseType: 'blob'
            });
            return URL.createObjectURL(response.data);
        } catch (error) {
            console.log("Error fetching profile picture" ,error);
            return null;
        }
    }

    React.useEffect(() => {
        reviews.forEach(async (review) => {
            if (!reviewerImages[review.reviewerId]) {
                const imgUrl = await fetchProfilePicture(review.reviewerId);
                if (imgUrl) {
                    setReviewerImages(prev => ({ ...prev, [review.reviewerId]: imgUrl }));
                }
            }
            if (review.reviewerId === userId) {
                setHaveReviewed(true);
            }
        });
    }, [reviews]);

    React.useEffect(() => {
        const getSimilarGames = () => {
            axios
                .get(`http://localhost:4941/api/v1/games/${id}`) // Fetch gameFull
                .then((response) => {
                    console.log('Current Game:', response.data); // Log the current game data
                    setGame(response.data);

                    axios.get('http://localhost:4941/api/v1/games')
                        .then((allGamesResponse) => {
                            console.log('All Games:', allGamesResponse.data); // Log all games data
                            const currentGame = response.data;

                            // todo: This is unnecessary! just use the filtering parameters in the GET games endpoint
                            // Filter similar games based on genreId or creatorId
                            const allGames = allGamesResponse.data.games || []; // Access the 'games' array
                            const filteredGames = allGames.filter((game: any) =>
                                (game.genreId === currentGame.genreId || game.creatorId === currentGame.creatorId) &&
                                game.gameId !== currentGame.gameId // Exclude the current game
                            );
                            setSimilarGames(filteredGames);
                            setShowSimilarGames(false);
                        })
                        .catch((error) => {
                            console.error('Error fetching all games:', error);

                            setErrorFlag(true);
                            setErrorMessage(error.toString());
                        });

                })
                .catch((error) => {
                    console.error('Error fetching current game:', error);

                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                });
        };
        getSimilarGames();
    }, [id]);

    React.useEffect(() => {
        console.log(images);
        const getImage = () => {
            axios.get(`http://localhost:4941/api/v1/games/${id}/image`, {
                responseType: 'blob',
            }).then((response) => {
                const imgURL = URL.createObjectURL(response.data);
                setImage(game.gameId, imgURL);
            }).catch((error) => {
                setImage(game.gameId, ''); // fallback image URL
                if (axios.isAxiosError(error) && error.response?.status !== 404) {
                    console.error(`Failed to load image for game ${game.gameId}`, error);
                }
            });
        };
        getImage();
    }, [game]);

    React.useEffect(() => {
        console.log(creatorImage);
        const getCreatorImage = () => {
            axios
                .get(`http://localhost:4941/api/v1/users/${game.creatorId}/image`, {
                    responseType: 'blob',
                })
                .then((response) => {
                    const imgURL = URL.createObjectURL(response.data);
                    setCreatorImage(imgURL);
                })
                .catch((error) => {
                    setCreatorImage('');
                    if (axios.isAxiosError(error) && error.response?.status !== 404) {
                        console.error(`Failed to load image for user ${game.creatorId}`, error);
                    }
                });
        };
        getCreatorImage();
    }, [updatedGameImage ,game.creatorId, setCreatorImage]);

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
        console.log(gameGenre);
        const getGameGenre = () => {
            axios
                .get(`http://localhost:4941/api/v1/games/genres`)
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setGameGenre(response.data);
                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(
                        error.toString() +
                        " defaulting to old games — changes in the app may not work as expected"
                    );
                });
        };
        getGameGenre();
    }, [game.genreId, setGameGenre]);

    React.useEffect(() => {
        const getGamePlatform = () => {
            axios
                .get(`http://localhost:4941/api/v1/games/platforms`)
                .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setGamePlatform(response.data);
                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(
                        error.toString() +
                        " defaulting to old games — changes in the app may not work as expected"
                    );
                });
        };
        getGamePlatform();
    }, [game.platformIds, setGamePlatform]);


    const paginatedGames = similarGames.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
        );
    const game_rows = () =>
        paginatedGames.map((row: Game) => (
        <GameListObject key={row.gameId + row.title}
                        game={row}
        />
        ));


    const handleDeleteDialogOpen = () => {
        setOpenDeleteDialog(true);
    };

    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
    };

    const deleteGame = () => {
        axios
            .delete(`http://localhost:4941/api/v1/games/${game.gameId}`,
                { headers: {
                        'X-Authorization': authToken
                    }
                })
            .then(() => {
                navigate('/listgames');
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };

    // Handle Edit Dialog
    const handleEditDialogOpen = () => {
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const showSnackbar = (message: string, type: "success" | "error" | "info" | "warning") => {
        setsnackbarMessage(message);
        setSnackbarType(type);
        setOpenSnackbar(true);
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(updatedTitle);
        console.log(updatedDescription);
        console.log(updatedPrice);
        console.log(updatedGenre);
        console.log(updatedPlatforms);

        if (errorMessage) {
            return;
        }
        const isUnique =  await handleTitleChange();
        console.log("isUnique", isUnique);

        if (!isUnique) return;
        axios
            .patch(`http://localhost:4941/api/v1/games/${game.gameId}`, {
                title: updatedTitle,
                description: updatedDescription,
                price: updatedPrice,
                genreId: updatedGenre,
                platformIds: updatedPlatforms,
            },
            {
                headers: {
                    'X-Authorization': authToken,
                }
            })
            .then(() => {
                handleGameImage(game.gameId);
                showSnackbar("Game editted successfully", "success");
                setOpenEditDialog(false);
                setGame({
                    ...game,
                    title: updatedTitle,
                    description: updatedDescription,
                    price: updatedPrice,
                    genreId: updatedGenre,
                    platformIds: updatedPlatforms,

                });
                setUpdatePage(true);
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    };


    if (showSimilarGames) {
        return <p>Loading...</p>;
    }


    if (errorFlag) {
        return (
            <div>
                <h1>Game Detail</h1>
                <div style={{ color: 'red' }}>{errorMessage}</div>
                <Link to="/listgames">Back to games</Link>
            </div>
        );
    }

    const handleGenresChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setUpdatedGenre(Number(value));
    };

    const handlePlatformsChange = (event: SelectChangeEvent<number[]>) => {
        const value = event.target.value;
        setUpdatedPlatforms(typeof value === 'string' ? value.split(',').map(Number) : value);
    };

    const handleTitleChange = async (): Promise<boolean> => {
        try {
            console.log("Updated Title:", updatedTitle);
            console.log("Original Title:", originalTitle);

            const response = await axios.get("http://localhost:4941/api/v1/games");

            const existingTitles = response.data.games
                .map((game: any) => game.title.toLowerCase())
                .filter((title: string) => title !== originalTitle.toLowerCase());

            if (existingTitles.includes(updatedTitle.toLowerCase())) {
                setErrorMessage("This game title already exists. Please choose another.");
                return false;
            }
            return true;
        } catch (error) {
            console.error("Failed to check title uniqueness:", error);
            setErrorMessage("Unable to validate title. Please try again.");
            return false;
        }
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file === null) {
            setUpdatedGameImage(null);
            setErrorMessage("");
            return;
        }
        if (file) {
            if (['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                setUpdatedGameImage(file);
                setErrorMessage("");
            } else {
                setUpdatedGameImage(null);
                setErrorMessage("Only JPEG, PNG, or GIF images are supported.");
            }
        }
    };

    const handleGameImage = async (gameId: number) => {
        if (!updatedGameImage) {
            setErrorMessage("");
            return;
        }

        await axios.put(`http://localhost:4941/api/v1/games/${gameId.toString()}/image`,
           updatedGameImage,
            {
                headers: {
                    'X-Authorization': localStorage.getItem('authToken'),
                    'Content-Type': updatedGameImage?.type,
                }
            }
        )
        .then(response => {
            setErrorMessage("");
        })
        .catch(err => {
            switch (err.response.status) {
                case 400:
                    setErrorMessage("Invalid Image. Only accept jpeg, png, or gif");
                    break;
                case 401:
                    setErrorMessage("Authentication Failed");
                    break;
                case 403:
                    setErrorMessage("Can not change another game  photo");
                    break;
                case 404:
                    setErrorMessage("game not found");
                    break;
                default:
                    setErrorMessage("Internal Server Error");
                    break;
            }
            // localStorage.removeItem('authToken');
            setUpdatedGameImage(null);
        })
    }

    const handleWishlistToggle = (gameId: number) => {
        if (!authToken) {
            navigate('/users/login');
            return;
        }
        if (isWishlisted && !isOwned) {
            axios.delete(
                `http://localhost:4941/api/v1/games/${gameId.toString()}/wishlist`,
                { headers: {
                    'X-Authorization': authToken
                    }
                })
                .then(() => {
                    setIsWishlisted(false);
                    showSnackbar("Game removed from Wishlist", "success");
                    setUpdatePage(true);
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                })
        } else if (!isOwned) {
            axios.post(
                `http://localhost:4941/api/v1/games/${gameId.toString()}/wishlist`,
                null,
                { headers: {
                        'X-Authorization': authToken
                    }
                })
                .then(() => {
                    setIsWishlisted(true);
                    showSnackbar("Game added to Wishlist", "success");
                    setUpdatePage(true);
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                })
        } else {
            showSnackbar("You cannot wishlist a game you already own!", "warning");
        }
    };

    const handleOwnedToggle = (gameId: number) => {
        if (!authToken) {
            navigate('/users/login');
            return;
        }
        if (isOwned) {
            axios.delete(
                `http://localhost:4941/api/v1/games/${gameId.toString()}/owned`,
                { headers: {
                    'X-Authorization': authToken
                }
                })
                .then(() => {
                    showSnackbar("Unmarked game as owned", "success");
                    setIsOwned(false);
                    setUpdatePage(true);
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                })
        } else {
            axios.post(
                `http://localhost:4941/api/v1/games/${gameId.toString()}/owned`,
                null,
                { headers: {
                        'X-Authorization': authToken
                    }
                })
                .then(() => {
                    showSnackbar("Marked game as owned", "success");
                    setIsOwned(true);
                    setIsWishlisted(false);
                    setUpdatePage(true);
                })
                .catch((error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.toString());
                })
        }
    };

    const handlePlaceReview = () => {
        if (!authToken) {
            navigate('/users/login');
            return;
        }
        setReviewDialogOpen(true);
    };

    const handleCloseReviewDialog = () => {
        setReviewDialogOpen(false);
    };

    const handleSaveReview = (gameId: number) => {
        let data;
        if (reviewText.length > 0) {
            data = {
                rating: ratingValue,
                review: reviewText
            }
        } else {
            data = {
                rating: ratingValue
            }
        }
        axios.post(`http://localhost:4941/api/v1/games/${gameId.toString()}/reviews`,
            data,
            { headers: {
                    'X-Authorization': authToken
                }
            })
            .then(() => {
                showSnackbar("Successfully placed review", "success");
                setReviewDialogOpen(false);
                setUpdatePage(true);
            })
            .catch((error) => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            })
    };

    return (

        <>
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
            </Box>
            <div>
                <h1>Game Detail</h1>

                <Card sx={userCardStyles}>
                    <CardMedia
                        component="img"
                        height="400"
                        width="200"
                        sx={{ objectFit: "cover" }}
                        image={images[game.gameId]}
                        alt={`${game.title} cover`}
                    />
                    <CardContent>
                        <Typography variant="h6">{game.title}</Typography> <br/>
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Typography variant="subtitle2" align="left">
                                <strong>Created on: </strong>{new Date(game.creationDate).toLocaleDateString('en-GB')} <br/>
                                <strong>Description: </strong>{game.description} <br/>

                                <strong>Genre: </strong>{gameGenre.find(g=>g.genreId=== game.genreId)?.name} <br/>
                                <strong>Platforms: </strong> {game.platformIds
                                .map((id: number) => gamePlatform.find(p => p.platformId === id)?.name)
                                .filter(Boolean)
                                .join(', ')} <br/>
                                <strong>Creator: </strong>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginLeft: "4px" }}>
                                {game.creatorFirstName} {game.creatorLastName}
                            </span> <br/>
                                <strong>Owner: </strong>{game.numberOfOwners} <br/>
                                <strong>Wishlist: </strong>{game.numberOfWishlists}<br/>
                                <strong>Rating: </strong>{game.rating} <br/>
                            </Typography>
                            <div>
                                <Typography variant="h6" align="right">
                                    <strong>${game.price/100} </strong>
                                </Typography>
                                <Avatar
                                    src={creatorImage.length > 0 ? creatorImage: "https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png"}
                                    alt="Creator"
                                >
                                </Avatar>
                            </div>
                        </Stack>
                    </CardContent>
                    {/* Buttons with handlers */}
                    {!createdByMe && (
                        <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                            <Button
                                variant={isWishlisted ? "outlined" : "contained"}
                                color="primary"
                                onClick={() => handleWishlistToggle(game.gameId)}
                            >
                                {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            </Button>
                            <Button
                                variant={isOwned ? "outlined" : "contained"}
                                color="secondary"
                                onClick={() => handleOwnedToggle(game.gameId)}
                            >
                                {isOwned ? "Unmark as Owned" : "Mark as Owned"}
                            </Button>
                        </CardActions>
                    )}
                </Card>

                <div style={{ marginTop: '10px' }}>
                    <Link to="/listgames">Back to games</Link>
                </div>

                {createdByMe && (
                    <>
                        <Button
                            variant="outlined"
                            color="primary"
                            endIcon={<EditIcon />}
                            onClick={handleEditDialogOpen}
                            sx={{ m: 1 }}
                        >
                            Edit
                        </Button>

                        {reviews.length <= 0 && (
                            <Button
                                variant="outlined"
                                color="error"
                                endIcon={<DeleteIcon />}
                                onClick={handleDeleteDialogOpen}
                                sx={{ m: 1 }}
                            >
                                Delete
                            </Button>
                        )}

                    </>
                )}

                {/* Edit Dialog */}
                <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                    <DialogTitle style={{ textAlign: 'center' }}>
                        Edit Game
                    </DialogTitle>
                    {errorMessage && <p style={{
                        color: 'red',
                        marginBottom: '10px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>{errorMessage}</p>}
                    <form onSubmit={handleEditSubmit}>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Title"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={updatedTitle}
                                onChange={e => {
                                    setUpdatedTitle(e.target.value);
                                    if (errorMessage) setErrorMessage("");
                                }}
                                required
                            />
                            <TextField
                                margin="dense"
                                label="Description"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={updatedDescription}
                                onChange={(e) => setUpdatedDescription(e.target.value)}
                                required
                            />
                            <TextField
                                margin="dense"
                                label="Price $"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={updatedPrice !== null ? (updatedPrice / 100).toString() : ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    console.log("Price selected:", value);
                                    if (value === '') {
                                        setUpdatedPrice(null);
                                    } else {
                                        const num = Number(value);
                                        if (!isNaN(num) && num >= 0) {
                                            setUpdatedPrice(Math.round(num * 100));
                                        }
                                    }
                                }}
                                inputProps={{ step: 0.01 }}
                                sx={{ minWidth: 150 }}
                                required
                            />
                            <FormControl component="fieldset" sx={{ display: 'flex' }}>
                                <FormLabel component="legend" sx={{ textAlign: 'left', mb: 1 }}>
                                    Genre
                                </FormLabel>
                                <RadioGroup
                                    value={updatedGenre}
                                    onChange={handleGenresChange}
                                    name="genre-radio-group"
                                    row
                                >
                                    {genres.map((genre) => (
                                        <FormControlLabel
                                            key={genre.id}
                                            value={genre.id}
                                            control={<Radio />}
                                            label={genre.name}
                                            sx={{ margin: 1 }}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel id="platform-select-label">Platforms</InputLabel>
                                <Select
                                    labelId="platform-select-label"
                                    multiple
                                    value={updatedPlatforms}
                                    onChange={handlePlatformsChange}
                                    input={<OutlinedInput label="Platforms" />}
                                    renderValue={(selected) =>
                                        platforms
                                            .filter((p) => selected.includes(p.id))

                                            .map((p) => p.name)
                                            .join(', ')
                                    }
                                >
                                    {platforms.map((platform) => (
                                        <MenuItem key={platform.id} value={platform.id}>
                                            <Checkbox checked={updatedPlatforms.includes(platform.id)} />
                                            <ListItemText primary={platform.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <label
                                style={{
                                    padding: '10px',
                                    backgroundColor: '#eee',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    width: '200px',
                                    display: 'block',
                                    margin: '16px auto',  // centers it horizontally
                                }}
                            >
                                Upload New Game Image
                                <input type="file"
                                       accept="image/*"
                                       onChange={handleFileChange}
                                       style={{ display: 'block', marginTop: '8px', width: '100%' }}
                                />
                            </label>

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEditDialog} color="secondary">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary" variant="contained">
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
                    <Box sx={{ position: 'relative', mb: 2 }}>

                        {!createdByMe && !haveReviewed && (
                            <Box sx={{ position: 'absolute', left: 0 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={() => handlePlaceReview()}
                                >
                                    Place Review
                                </Button>
                            </Box>
                        )}

                        <Typography variant="h5" align="center">
                            Reviews ({reviews.length})
                        </Typography>
                    </Box>
                    {reviews.length === 0 ? (
                        <p>No reviews yet.</p>
                    ) : (
                        <div>
                            {reviews.map((review) => (
                                <Card key={review.reviewerId} sx={{ marginBottom: '15px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                                    <CardContent>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                            {/* Reviewer Profile Image (if exists) */}
                                            <Avatar
                                                src={reviewerImages[review.reviewerId] || defaultUserImage}
                                            />
                                            <div>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '16px' }}>
                                                    {review.reviewerFirstName} {review.reviewerLastName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(review.timestamp).toLocaleDateString('en-GB')}
                                                </Typography>
                                            </div>
                                        </div>

                                        {/* Rating displayed as stars */}
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                            <Rating
                                                value={review.rating / 2} // Scaling rating (e.g., 10/2 = 5 stars max)
                                                readOnly
                                                precision={0.5}
                                                sx={{ marginRight: '10px' }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Rating:</strong> {review.rating}/10
                                            </Typography>
                                        </div>

                                        {/* Review text */}
                                        {review.review && (
                                            <Typography variant="body2" color="text.primary" sx={{ textAlign: 'left' }}>
                                                <strong>Review:</strong> {review.review}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={4000}
                    onClose={() => {setOpenSnackbar(false)}}
                    message={snackbarMessage}
                >
                    <Alert severity={snackbarType} onClose={() => {setOpenSnackbar(false)}}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
                <div>
                    {/* Similar Games Section */}
                    <h2>Similar Games</h2>
                    {similarGames.length === 0 ? (
                        <p>No similar games found.</p>
                    ) : (
                        <Grid container spacing={2}>
                            {game_rows()}
                        </Grid>
                    )}
                </div>

                <Dialog
                    open={openDeleteDialog}
                    onClose={handleDeleteDialogClose}
                >
                    <DialogTitle>Delete Game?</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this game?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={deleteGame}
                            autoFocus
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={reviewDialogOpen} onClose={handleCloseReviewDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Leave a Review</DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Rating Section */}
                            <Box>
                                <Typography gutterBottom>Rating (out of 10)</Typography>
                                <Rating
                                    name="review-rating"
                                    value={ratingValue / 2}
                                    onChange={(_, newValue) => {
                                        const safeValue = Math.max(0.5, newValue ?? 0.5);
                                        setRatingValue(safeValue * 2);
                                    }}
                                    precision={0.5}
                                />
                                <Typography variant="body2">Selected: {ratingValue}/10</Typography>
                            </Box>

                            {/* Text Section */}
                            <TextField
                                label="Your Review"
                                multiline
                                rows={4}
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                variant="outlined"
                                fullWidth
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ paddingRight: 3, paddingBottom: 2 }}>
                        <Button onClick={handleCloseReviewDialog}>Cancel</Button>
                        <Button onClick={() => handleSaveReview(game.gameId)} variant="contained" color="primary">Save Review</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};


export default Game;
