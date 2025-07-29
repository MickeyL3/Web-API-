import React, {useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    Select,
    Checkbox,
    FormControl,
    InputLabel,
    MenuItem,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
} from '@mui/material';
import ListItemText from "@mui/material/ListItemText";
import {SelectChangeEvent} from "@mui/material/Select";
import OutlinedInput from "@mui/material/OutlinedInput";

const CreateGame = () => {
    const [error, setErrorMessage] = React.useState("");
    const [selectedGenre, setSelectedGenre] = React.useState<number>(0);
    const [selectedPlatforms, setSelectedPlatforms] = React.useState<number[]>([]);
    const [selectedTitle, setSelectedTitle] = React.useState("");
    const [selectedDescription, setSelectedDescription] = React.useState("");
    const [selectedPrice, setSelectedPrice] = React.useState<number | null>(null);
    const [gameImage, setGameImage] = useState<File | null>(null);
    const [createTriggered, setCreateTriggered] = React.useState(false);
    const authToken = localStorage.getItem("authToken");
    const navigate = useNavigate();

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file === null) {
            setGameImage(null);
            setErrorMessage("");
            return;
        }
        if (['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            setGameImage(file);
            setErrorMessage("");
        } else {
            setGameImage(null);
            setErrorMessage("Only JPEG, PNG, or GIF images are supported.");
        }

    };
    const handleGameImage = (gameId: number) => {
        if (!gameImage) {
            setErrorMessage("");
            return;
        }
        axios.put(`http://localhost:4941/api/v1/games/${gameId.toString()}/image`,
            gameImage,
            {
                headers: {
                    'X-Authorization': localStorage.getItem('authToken'),
                    'Content-Type': gameImage?.type,
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
                    setErrorMessage("Can not change another game image photo");
                    break;
                case 404:
                    setErrorMessage("Image not found");
                    break;
                default:
                    setErrorMessage("Internal Server Error");
                    break;
            }
            localStorage.removeItem('authToken');
            setCreateTriggered(false);
            setGameImage(null);
        })

    }

    const handleGenresChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSelectedGenre(Number(value));
    };


    const handlePlatformsChange = (event: SelectChangeEvent<number[]>) => {
        const value = event.target.value;
        setSelectedPlatforms(typeof value === 'string' ? value.split(',').map(Number) : value);
    };

    const handleTitleUnique = async (): Promise<boolean> => {
        try {
            const response = await axios.get("http://localhost:4941/api/v1/games");
            const data = response.data.games;
            const existingTitles = data.map((game: any) => game.title.toLowerCase());

            if (existingTitles.includes(selectedTitle.toLowerCase())) {
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

    React.useEffect(() => {
        if (!localStorage.getItem('userId')) {
            navigate('/users/login');
        }
    }, []);


    React.useEffect(() => {
        const handleCreateGames = () => {
            if (!createTriggered) return;
            if (error) {
                setCreateTriggered(false);
                return;
            }
            console.log(selectedTitle);
            console.log(selectedDescription);
            console.log(selectedPrice);
            console.log(selectedGenre);
            console.log(selectedPlatforms);

            axios.post(
                "http://localhost:4941/api/v1/games",
                {
                    title: selectedTitle,
                    description: selectedDescription,
                    genreId: selectedGenre,
                    price: selectedPrice,
                    platformIds: selectedPlatforms,
                },
                { headers: {
                        'X-Authorization': authToken
                    }
                })
                .then(response => {
                    handleGameImage(response.data.gameId);
                    navigate("/listgames");
                })
            .catch((err) => {
                console.error("CreateGame error:", err.response || err);
            })
            setCreateTriggered(false);
        };
        handleCreateGames();
    }, [createTriggered]);
    const createSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage("");
        console.log({
            selectedTitle,
            selectedDescription,
            selectedGenre,
            selectedPrice,
            selectedPlatforms
        });
        const isUnique =  handleTitleUnique();
        if (!isUnique) return;
        if (
            !selectedTitle.trim() ||
            !selectedDescription.trim() ||
            !selectedGenre ||
            selectedPlatforms.length === 0 ||
            selectedPrice === null || selectedPrice === undefined

        ) {
            setErrorMessage("Please fill out all required fields.");
            return;
        }

        setCreateTriggered(true);

    };

    return (
        <div style={{
            maxWidth: '500px',
            margin: '40px auto',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fdfdfd',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            fontFamily: 'sans-serif',
        }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: '20px',
            }}>Create a New Game</h2>

            {error && <p style={{
                color: 'red',
                marginBottom: '10px',
                fontSize: '0.9rem',
            }}>{error}</p>}

            <form
                onSubmit={createSubmit}
                style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>

                <input
                    type="text"
                    value={selectedTitle}
                    onChange={e => {
                        setSelectedTitle(e.target.value);
                        if (error) setErrorMessage("");
                    }}
                    placeholder="Title"
                    style={{
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                    }}
                    required
                />

                <input
                    type="text"
                    value={selectedDescription}
                    onChange={e => setSelectedDescription(e.target.value)}
                    placeholder="Description"
                    style={{
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                    }}
                    required
                />

                <input
                    type="number"
                    value={selectedPrice !== null ? (selectedPrice / 100).toString() : ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                            setSelectedPrice(null);
                        } else {
                            const num = Number(value);
                            if (!isNaN(num) && num >= 0) {
                                setSelectedPrice(Math.round(num * 100));
                            }
                        }
                    }}
                    placeholder="Price"
                    step="0.01"
                    style={{
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                    }}
                    required
                />




                <FormControl component="fieldset" sx={{ display: 'flex' }}>
                    <FormLabel component="legend" sx={{ textAlign: 'left', mb: 1 }}>
                        Genre
                    </FormLabel>
                    <RadioGroup
                        value={selectedGenre}
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
                        value={selectedPlatforms}
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
                                <Checkbox checked={selectedPlatforms.includes(platform.id)} />
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
                    Upload Game Image
                    <input type="file"
                           accept="image/*"
                           onChange={handleFileChange}
                           style={{ display: 'block', marginTop: '8px', width: '100%' }}
                    />
                </label>
                <button type="submit"
                        disabled={!!error}
                        style={{
                    padding: '10px',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                }}
                >
                    Submit
                </button>
            </form>
        </div>
    );
}
export default CreateGame;
