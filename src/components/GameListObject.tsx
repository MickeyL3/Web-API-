import React from "react";
import axios from "axios";
import {useGameStore} from "../store";
import {
    Avatar,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Stack,
    Typography
} from "@mui/material";
import CSS from "csstype";
import {useNavigate} from "react-router-dom";

interface IGameProps {
    game: Game,
    image?: string
}

const GameListObject = (props: IGameProps) => {
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [game] = React.useState<Game>(props.game);
    const setImage = useGameStore((state) => state.setImage);
    const images = useGameStore((state) => state.gameImages);
    const [userImage, setUserImage] = React.useState('');
    const [gameGenre, setGameGenre] = React.useState<Genre[]>([]);
    const [gamePlatform, setGamePlatform] = React.useState<Platform[]>([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        console.log(images);
        const getImage = () => {
            axios.get(`http://localhost:4941/api/v1/games/${game.gameId}/image`, {
                responseType: 'blob',
            }).then((response) => {
                const imgURL = URL.createObjectURL(response.data);
                setImage(game.gameId, imgURL);
            }).catch((error) => {
                setImage(game.gameId, '');
                if (axios.isAxiosError(error) && error.response?.status !== 404) {
                    console.error(`Failed to load image for game ${game.gameId}`, error);
                }
            });
        };
        getImage();
    }, [setImage]);

    React.useEffect(() => {
        console.log(userImage);
        const getUserImage = () => {
            axios
                .get(`http://localhost:4941/api/v1/users/${game.creatorId}/image`, {
                    responseType: 'blob',
                })
                .then((response) => {
                    const imgURL = URL.createObjectURL(response.data);
                    setUserImage(imgURL);
                })
                .catch((error) => {
                    setUserImage('');
                    if (axios.isAxiosError(error) && error.response?.status !== 404) {
                        console.error(`Failed to load image for user ${game.creatorId}`, error);
                    }
                });
        };
        getUserImage();
    }, [game.creatorId, setUserImage]);

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

    const userCardStyles: CSS.Properties = {
        display: "inline-block",
        height: "550px",
        width: "300px",
        margin: "10px",
        padding: "0px"
    };
    if (errorFlag) {
        return (
            <div>
                <h1>Games List</h1>
                <div style={{ color: 'red' }}>{errorMessage}</div>
            </div>
        );
    }

    return (
        <>
            <Card onClick={() => navigate(`/games/${game.gameId}`)} sx={[userCardStyles, {cursor: "pointer"}]}>
                <CardMedia
                    component="img"
                    height="300"
                    width="200"
                    sx={{objectFit: "cover"}}
                    image= {images[game.gameId]}
                    alt={`${game.title} cover`}
                />
                <CardContent>
                    <Typography variant="h6">{game.title}</Typography> <br/>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Typography variant="subtitle2" align="left">
                            <strong>Created on: </strong>{new Date(game.creationDate).toLocaleDateString('en-GB')} <br/>
                            <strong>Genre: </strong>{gameGenre.find(g=>g.genreId=== game.genreId)?.name} <br/>
                            <strong>Platform: </strong>
                            {game.platformIds
                                .map(id => gamePlatform.find(p => p.platformId === id)?.name)
                                .filter(Boolean)
                                .join(', ')} <br/>
                            <strong>Creator: </strong>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginLeft: "4px" }}>
                                {game.creatorFirstName} {game.creatorLastName} <br/>
                            </span>
                        </Typography>
                        <div>
                            <Typography variant="h6" align="right">
                                <strong>${game.price/100} </strong> <br/>
                            </Typography>
                            <Avatar
                                src={userImage.length > 0 ? userImage: "https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png"}
                                alt="User"
                                >

                            </Avatar>
                        </div>
                    </Stack>
                </CardContent>
                <CardActions>

                </CardActions>
            </Card>

        </>
    );
};

export default GameListObject;