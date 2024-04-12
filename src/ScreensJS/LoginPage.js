import React, {useState} from 'react';
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import './LoginPage.css'
import db from '../DB/firebase'; // Ensure this is the correct path to your Firebase config

function SignIn({ email, setEmail, password, setPassword, handleLogin,setHasAccount}) {
    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="input-group">
                    <input
                        type="email"
                        className="form-input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        className="form-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
            <div className="forgot-password">Forgot password?</div>
            <div className="toggle-form">
                Don't have an account? <span className="sign-up-link" onClick={() => setHasAccount(false)}>Sign up here</span>
            </div>
        </div>
    );
}
function SignUp({ email, setEmail, password, setPassword, handleSignUp,setHasAccount}) {
    return (
        <div className="login-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp}>
                <div className="input-group">
                    <input
                        type="email"
                        className="form-input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <input
                        type="password"
                        className="form-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Sign Up</button>
            </form>
            <div className="toggle-form">
                Already have an account? <span className="sign-up-link" onClick={() => setHasAccount(true)}>Login here</span>
            </div>
        </div>
    );
}


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
                setEmail('');
                setPassword('');
                error && setError('');
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
        <div className="login-container">
            {hasAccount ? (
                <SignIn
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    handleLogin={handleLogin}
                    setHasAccount={setHasAccount}
                />
            ) : (
                <SignUp
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    handleSignUp={handleSignUp}
                    setHasAccount={setHasAccount}
                />
            )}
            {error && <p>{error}</p>}
        </div>
    );
}

export default AuthPage;
