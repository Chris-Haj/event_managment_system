import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import db from '../DB/firebase'; // Ensure this is the correct path to your Firebase config

function AuthPage() {
    const [hasAccount, setHasAccount] = useState(true); // Toggle between login and sign-up
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = getAuth(db);

    const handleSignUp = (e) => {
        e.preventDefault();
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                console.log('Account created:', userCredential.user);
                setHasAccount(true); // Optionally switch to login view after sign up
            })
            .catch((error) => {
                setError(`Error: ${error.code} ${error.message}`);
            });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                console.log('User logged in:', userCredential.user);
            })
            .catch((error) => {
                setError(`Error: ${error.code} ${error.message}`);
            });
    };

    return (
        <div>
            {hasAccount ? (
                <div>
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
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
                        <button type="submit">Login</button>
                    </form>
                    <button onClick={() => setHasAccount(false)}>Don't have an account? Sign up here</button>
                </div>
            ) : (
                <div>
                    <h2>Sign Up</h2>
                    <form onSubmit={handleSignUp}>
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
                    <button onClick={() => setHasAccount(true)}>Already have an account? Login here</button>
                </div>
            )}
            {error && <p>{error}</p>}
        </div>
    );
}

export default AuthPage;
