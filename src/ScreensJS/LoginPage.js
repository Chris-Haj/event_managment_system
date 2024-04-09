// src/LoginPage.js

import React, {useState} from 'react';
import Logo from '../Images/YovalimLogo.png'
import './LoginPage.css'; // Import the CSS file for styling
import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth'
import db from '../DB/firebase'



function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const auth = getAuth(db);

    const handleSubmit = (e) => {
        e.preventDefault();
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log('Account created:', user);
                // Redirect the user or show a success message
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setError(`Error: ${errorCode} ${errorMessage}`);
                // Handle errors here, such as displaying a notification
            });
    };
    return (
        <div>
            <h1>Sign Up</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}

function LoginPage() {

    const [signedIn,setSignedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the form from submitting in the traditional way
        console.log(email, password); // For demonstration: log the email and password
        // Here, you would typically handle the login logic, such as making an API call
    };

    const signUpHTML =
        <div className={''}>

        </div>

    return (
        <div className="login-container">
                <img src={Logo} className="App-logo" alt="logo" />
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;
