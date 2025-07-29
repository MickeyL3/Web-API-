
import React, { useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Alert, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';

const defaultProfileImage = 'https://png.pngitem.com/pimgs/s/150-1503945_transparent-user-png-default-user-image-png-png.png'

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [logoutTriggered, setLogoutTriggered] = React.useState(false);
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem(('userId'));
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = React.useState("");
    const [user, setUser] = useState<any>(null);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
    const [currentFirstName, setCurrentFirstName] = useState("");
    const [currentLastName, setCurrentLastName] = useState("");
    const [currentEmail, setCurrentEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            if (['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                setProfilePicture(file);
                setProfilePictureUrl(URL.createObjectURL(file));
                setErrorMessage("");
                setRemoveProfilePicture(false);
            } else {
                setErrorMessage("Only JPEG, PNG, or GIF images are supported.");
            }
        }
    };
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
                {
                    headers: {
                        'X-Authorization': authToken
                    }
                })
                .then(response => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
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
                    {headers: {'X-Authorization': authToken}}
                );
                const userData = response.data;
                setUser(userData);
                setFirstName(userData.firstName);
                setCurrentFirstName(userData.firstName);
                setLastName(userData.lastName);
                setCurrentLastName(userData.lastName);
                setEmail(userData.email);
                setCurrentEmail(userData.email);
                const imageResponse = await axios.get(
                    `http://localhost:4941/api/v1/users/${localStorage.getItem('userId')}/image`,
                    {responseType: 'blob'}
                );
                setProfilePictureUrl(URL.createObjectURL(imageResponse.data));
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setProfilePictureUrl(defaultProfileImage);
                } else {
                        setErrorMessage('Failed to fetch profile.');
                    }
            } finally {
                setLoading(false);
            }
        };
        getProfile();
    }, []);
    const handleRemovePicture = () => {
        setRemoveProfilePicture(true);
        setProfilePicture(null);
        setProfilePictureUrl(defaultProfileImage);
    };

    const handleUpdateProfile = async () => {
        setErrorMessage("");
        console.log("handleUpdateProfile called");
        const userId = localStorage.getItem('userId');
        const authToken = localStorage.getItem('authToken');
        if (!userId || !authToken) {
            setErrorMessage("Invalid user session.");
            return;
        }
        if (currentPassword || newPassword) {
            if (!currentPassword) {
                setErrorMessage("Current password is required to update password.");
                return;
            }
            if (!newPassword) {
                setErrorMessage("New password is required.");
                return;
            }
            if (newPassword.length < 6) {
                setErrorMessage("New password must be at least 6 characters.");
                return;
            }
            if (newPassword === currentPassword) {
                setErrorMessage("New password cannot be the same as current password.");
                return;
            }
        }

        const payload: any = {};
        if (firstName !== user?.firstName) payload.firstName = firstName;
        if (lastName !== user?.lastName) payload.lastName = lastName;
        if (email !== user?.email) payload.email = email;

        if (currentPassword && newPassword) {
            payload.currentPassword = currentPassword;
            payload.password = newPassword;
        }

        console.log("Payload to send:", payload);

        try {
            if (Object.keys(payload).length > 0) {
                const response = await axios.patch(
                    `http://localhost:4941/api/v1/users/${userId}`,
                    payload,
                    {headers: {'X-Authorization': authToken}}
                );
                console.log("Profile updated:", response.status);
            }
            if (profilePicture && profilePicture instanceof File) {
                const imageResponse = await profilePicture.arrayBuffer();

                await axios.put(
                    `http://localhost:4941/api/v1/users/${userId}/image`,
                    new Uint8Array(imageResponse),
                    {
                        headers: {
                            'X-Authorization': authToken,
                            'Content-Type': profilePicture.type
                        }
                    }
                );
            }
            if (removeProfilePicture) {
                await axios.delete(
                    `http://localhost:4941/api/v1/users/${userId}/image`,
                    {
                        headers: { 'X-Authorization': authToken }
                    }
                );
                setRemoveProfilePicture(false);
                setProfilePictureUrl(defaultProfileImage);
            }

            setFirstName(currentFirstName);
            setLastName(currentLastName);
            setEmail(currentEmail);
            setNewPassword('');
            setCurrentPassword('');
            setRemoveProfilePicture(false);
            navigate("/listgames");
        } catch (error: any) {
            console.error("Update profile error:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
            } else {
                console.error("No response from server");
            }
            switch (error.response.status) {
                case 400:
                    setErrorMessage("Your password must be at least 6 characters");
                    break;
                case 401:
                    setErrorMessage("Current password is incorrect.");
                    break;
                case 403:
                    setErrorMessage("This email is already in use");
                    break;
                default:
                    setErrorMessage("Internal Server Error");
                    break;
            }
        }
    }


        if (loading) return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress/>
            </Box>
        );

        if (!user) return (
            <Box p={4}>
                <Alert severity="error">{errorMessage || 'User not found.'}</Alert>
            </Box>
        );

        return (
            <Box p={4} display="flex" flexDirection="column" alignItems="center" width="100%" maxWidth="500px"
                 mx="auto">
                {/* Profile Picture Preview */}
                <Avatar
                    src={profilePicture ? URL.createObjectURL(profilePicture) : profilePictureUrl || defaultProfileImage}
                    alt="Profile"
                    sx={{width: 120, height: 120, mb: 2}}
                />
                {/* Upload New Picture */}
                <label style={{marginBottom: '16px'}}>
                    Upload New Picture
                    <input type="file"
                           accept="image/*"
                           onChange={handleFileChange}
                           style={{display: 'block', marginTop: '8px',marginLeft: 'auto', marginRight: 'auto', width: '85%'}}/>

                </label>

                <label
                    onClick={handleRemovePicture}
                    style={{ cursor: 'pointer', color: '#d32f2f', textDecoration: 'underline', userSelect: 'none', marginBottom: '12px'}}
                >
                    Remove Picture
                </label>

                {/* Input fields for first name, last name, email */}
                <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    style={{
                        marginBottom: '12px',
                        padding: '10px',
                        width: '100%',
                        fontSize: '1rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    required
                />
                <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    style={{
                        marginBottom: '12px',
                        padding: '10px',
                        width: '100%',
                        fontSize: '1rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    required
                />
                <input
                    type="email"
                    value={email}
                    onChange={e => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Email"
                    style={{
                        marginBottom: '12px',
                        padding: '10px',
                        width: '100%',
                        fontSize: '1rem',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    required
                />

                {/* Current Password Field */}
                <div style={{position: 'relative', marginBottom: '12px', width: '100%'}}>
                    <input
                        type={showPasswords ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => {
                            setCurrentPassword(e.target.value);
                            if (errorMessage) setErrorMessage("");
                        }}
                        placeholder="Current Password"
                        style={{
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            paddingRight: '40px',
                            width: '100%',
                            textAlign: 'left',
                            boxSizing: 'border-box',
                        }}
                        required
                    />
                    <span
                        onClick={() => setShowPasswords(!showPasswords)}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '10px',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            userSelect: 'none',
                        }}
                        title={showPasswords ? 'Hide password' : 'Show password'}
                    >
            {showPasswords ? <VisibilityOff/> : <Visibility/>}
        </span>
                </div>

                {/* New Password Field */}
                <div style={{position: 'relative', marginBottom: '12px', width: '100%'}}>
                    <input
                        type={showPasswords ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => {
                            setNewPassword(e.target.value);
                            if (errorMessage) setErrorMessage("");
                        }}
                        placeholder="New Password"
                        style={{
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            paddingRight: '40px',
                            width: '100%',
                            textAlign: 'left',
                            boxSizing: 'border-box',
                        }}
                    />
                    <span
                        onClick={() => setShowPasswords(!showPasswords)}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '10px',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            userSelect: 'none',
                        }}
                        title={showPasswords ? 'Hide password' : 'Show password'}
                    >
            {showPasswords ? <VisibilityOff/> : <Visibility/>}
        </span>
                </div>
                {/* Error Message */}
                {errorMessage && (
                    <p style={{
                        color: 'red',
                        marginBottom: '10px',
                        fontSize: '0.9rem',
                    }}>
                        {errorMessage}
                    </p>
                )}

                {/* Save Button */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateProfile}
                    sx={{mt: 2}}
                >
                    Save Changes
                </Button>

                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setLogoutTriggered(true)}
                    sx={{mt: 2}}
                >
                    Log Out
                </Button>
            </Box>
        );
    };
export default Profile;