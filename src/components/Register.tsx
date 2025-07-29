import React, {useState} from "react";
import axios from "axios";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {Alert, Snackbar} from "@mui/material";
import {useNavigate} from "react-router-dom";

const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [error, setErrorMessage] = useState("");
    const [registerTriggered, setRegisterTriggered] = useState(false);
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState("");

    const handleSnackClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file === null) {
            setProfilePicture(null);
            setErrorMessage("");
            return;
        }
        if (['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            setProfilePicture(file);
            setErrorMessage("");
        } else {
            setProfilePicture(null);
            setErrorMessage("Only JPEG, PNG, or GIF images are supported.");
        }

    };

    React.useEffect(() => {
        if (localStorage.getItem('userId')) {
            navigate('/listgames');
        }
    }, []);


    React.useEffect(() => {
        const handleRegister = () => {
            if (!registerTriggered) return;
            if (error) {
                setRegisterTriggered(false);
                return;
            }
            const formData = new FormData();
            formData.append("firstName", firstName);
            formData.append("lastName", lastName);
            formData.append("email", email);
            formData.append("password", password);

            const data = {firstName, lastName, email, password};
            console.log(data);
            axios.post("http://localhost:4941/api/v1/users/register", data)
                .then(response => {
                    localStorage.setItem("userId", response.data.userId);
                    if (response.data.userId){
                        handleLogin();
                    }
                    setSnackMessage("Register successfully");
                    setSnackOpen(true);
                    navigate("/listgames");
                })
                .catch(err => {
                    switch (err.response.status) {
                        case 400:
                            setErrorMessage("Your password must be at least 6 characters");
                            break;
                        case 403:
                            setErrorMessage("This email is already in use");
                            break;
                        default:
                            setErrorMessage("Internal Server Error");
                            break;
                    }
                })
                .finally(() => {
                    setRegisterTriggered(false);
                });
        };
        handleRegister();
    }, [registerTriggered]);

    const handleLogin = async () => {
        axios.post(`http://localhost:4941/api/v1/users/login`, {email, password})
            .then(response => {
                localStorage.setItem('authToken', response.data.token);
                console.log("Auth token set: " + response.data.token);
                handleUpdateProfilePicture();
            })
            .catch(err => {
                console.error("Login error:", err.response || err);
                setErrorMessage(err.response.statusText);
            });
    }

    const registerSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage("");
        setRegisterTriggered(true);

    };

    const handleUpdateProfilePicture = () => {
        console.log(localStorage.getItem('authToken'));
        console.log(profilePicture?.type)
        if (!profilePicture) {
            setErrorMessage("");
            return;
        }

        axios.put(`http://localhost:4941/api/v1/users/${localStorage.getItem('userId')}/image`,
            profilePicture,
            {
                headers: {
                    'X-Authorization': localStorage.getItem('authToken'),
                    'Content-Type': profilePicture?.type,
                }
            })
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
                    setErrorMessage("Can not change another users profile photo");
                    break;
                case 404:
                    setErrorMessage("User not found");
                    break;
                default:
                    setErrorMessage("Internal Server Error");
                    break;
            }
            setRegisterTriggered(false);
            localStorage.removeItem('authToken');
            setProfilePicture(null);
        })
    }

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
            }}>Register</h2>

            {error && <p style={{
                color: 'red',
                marginBottom: '10px',
                fontSize: '0.9rem',
            }}>{error}</p>}

            <form onSubmit={registerSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>
                <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First Name"
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
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Last Name"
                    style={{
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                    }}
                    required
                />

                <input
                    type="email"
                    value={email}
                    onChange={e => {
                        setEmail(e.target.value);
                        if (error) setErrorMessage("");
                    }}
                    placeholder="Email"
                    style={{
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                    }}
                    required
                />

                <div style={{position: 'relative'}}>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
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
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '10px',
                            transform: 'translateY(-50%)',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            userSelect: 'none',


                        }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                    >
                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                </span>
                </div>
                {/* Upload New Picture */}
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
                    Upload Profile Picture
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
                    width: '130px',
                    alignSelf: 'center',

                }}>
                    Register
                </button>
                <Snackbar
                    open={snackOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackClose}
                >
                    <Alert severity="success" onClose={handleSnackClose}>
                        {snackMessage}
                    </Alert>
                </Snackbar>
            </form>
        </div>
    );
}


export default Register;




