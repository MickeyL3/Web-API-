
import React, { useState } from 'react';
import {
    Typography,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Alert,
    AppBar,
    Container,
    Toolbar,
    IconButton
} from '@mui/material';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

const defaultProfileImage = 'https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png'

const ViewProfile = () => {
    const [loading, setLoading] = useState(true);
    const [isLoginSuccess, setIsLoginSuccess] = React.useState(false);
    const [logoutTriggered, setLogoutTriggered] = React.useState(false);
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem(('userId'));
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = React.useState("");
    const [user, setUser] = useState<any>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);

    React.useEffect(() => {
        if (authToken) {
            setIsLoginSuccess(true);
        }
    }, []);

    React.useEffect(() => {
        if (!localStorage.getItem('userId')) {
            navigate('/users/login');
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

    React.useEffect(() => {
        const getProfile = async () => {
            if (!userId || isNaN(Number(userId)) || !authToken) {
                setErrorMessage('Invalid user session. Please log in again.');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(
                    `http://localhost:4941/api/v1/users/${userId}`,
                    { headers: { 'X-Authorization': authToken } }
                );
                setUser(response.data);
                const imageResponse = await axios.get(
                    `http://localhost:4941/api/v1/users/${localStorage.getItem('userId')}/image`,
                    {responseType: 'blob'}
                );
                setProfilePictureUrl(URL.createObjectURL(imageResponse.data));
            } catch (error: any) {
                setErrorMessage('Failed to fetch profile.');
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, []);



    if (loading) return <CircularProgress />;

    if (loading) return (
        <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
        </Box>
    );

    if (!user) return (
        <Box p={4}>
            <Alert severity="error">{errorMessage || 'User not found.'}</Alert>
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
        {/*<Box sx={{ flexGrow: 1 }}>*/}
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
                                    src={profilePicture ? URL.createObjectURL(profilePicture) : profilePictureUrl || defaultProfileImage}                                        sx={{ width: 56, height: 56 }}
                                />
                            </IconButton>


                            {!isLoginSuccess ? (
                                <>
                                    <Button color="inherit" component={Link} to="/users/login">Login</Button>
                                    <Button color="inherit" component={Link} to="/users/register">Register</Button>
                                </>
                            ) : (
                                <>
                                    <Button color="inherit" component={Link} to="/users/profile">Profile</Button>
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
            </AppBar> <br/>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
            <Avatar
                src={profilePicture ? URL.createObjectURL(profilePicture) : profilePictureUrl || defaultProfileImage}
                alt="Profile"
                sx={{ width: 300, height: 300, mb: 2 }}
            />
            </Box>

            <Typography variant="h5" gutterBottom>
                {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                {user.email} <br/>
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    flexDirection: 'column',
                    gap: 2,
                    mt: 4
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/users/profile"
                    sx={{ width: 'fit-content', mt: 1 }}
                >
                    Edit Profile
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setLogoutTriggered(true)}
                    sx={{ width: 'fit-content', mt: 1 }}
                >
                    Log Out
                </Button>
            </Box>


        </Box>
    );
};

export default ViewProfile;