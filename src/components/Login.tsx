
import axios from 'axios';
import React from "react";
import { useNavigate } from 'react-router-dom';
import {Alert, Snackbar} from "@mui/material";
const Login = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const [loginTriggered, setLoginTriggered] = React.useState(false);
    const navigate = useNavigate();
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState("");

    const handleSnackClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackOpen(false);
    };

    React.useEffect(() => {
        if (localStorage.getItem('userId')) {
            navigate('/listgames');
        }
    }, []);


    React.useEffect(() => {
        const handleLogin = () => {
            if (!loginTriggered) return;
            console.log("Logging in with email:", email, "and password:", password);

            axios.post("http://localhost:4941/api/v1/users/login", {email, password})
                .then(response => {
                    localStorage.setItem('authToken', response.data.token);
                    localStorage.setItem('userId', response.data.userId);
                    setSnackMessage("Login successfully");
                    setSnackOpen(true);
                    navigate('/listgames');

                })
                .catch(err => {
                    console.error("Login error:", err.response || err); // Log the error for more details
                    setLoginTriggered(false);
                    setError("Invalid email or password.");
                });
        };
        handleLogin();
    }, [loginTriggered, email, password]);
    const triggerLogin = (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setLoginTriggered(true);
    };
    return (
        <div style={{
            maxWidth: '400px',
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
            }}>Login</h2>

            {error && <p style={{
                color: 'red',
                marginBottom: '10px',
                fontSize: '0.9rem',
            }}>{error}</p>}

            <form onSubmit={triggerLogin} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>
                <input
                    type="email"
                    value={email}
                    onChange={e => {
                        setEmail(e.target.value);
                        if (error) setError("");
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
                <input
                    type="password"
                    value={password}
                    onChange={e => {
                        setPassword(e.target.value);
                        if (error) setError("");
                    }}
                    placeholder="Password"
                    style={{
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '1rem',
                    }}
                    required
                />
                <button type="submit" style={{
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
                    Login
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

            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                Don't have an account?{' '}
                <span
                    style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => navigate('/users/register')}
                >
                    Register
                </span>
            </p>
        </div>
    );
}
export default Login;