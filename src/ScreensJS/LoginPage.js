import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../Images/YovalimLogo.png';
import db from '../DB/firebase'; // Ensure this is the correct path to your Firebase config
import app from '../DB/firebase.js'

function SignIn({ email, setEmail, password, setPassword, handleLogin, setHasAccount }) {
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
                <button type="submit" className="btn btn-primary btn-block mb-4">Login</button>
            </form>
            <div className="forgot-password">Forgot password?</div>
            <div className="toggle-form">
                Don't have an account? <span className="sign-up-link" onClick={() => setHasAccount(false)}>Sign up here</span>
            </div>
        </div>
    );
}

function SignUp({ email, setEmail, password, setPassword, handleSignUp, setHasAccount }) {
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
                <button type="submit" className="btn btn-primary btn-block mb-4">Sign Up</button>
            </form>
            <div className="toggle-form">
                Already have an account? <span className="sign-up-link" onClick={() => setHasAccount(true)}>Login here</span>
            </div>
        </div>
    );
}

function AuthPage() {
    const [hasAccount, setHasAccount] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = getAuth();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, 'users', user.uid), { role: 'user' });
            setHasAccount(true);
            setEmail('');
            setPassword('');
            setError('');
        } catch (error) {
            setError(`Error: ${error.code} ${error.message}`);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().role === 'admin') {
                console.log('Admin logged in');
                // Redirect to admin dashboard
            } else {
                console.log('User logged in');
            }
        } catch (error) {
            setError(`Error: ${error.code} ${error.message}`);
        }
    };

    return (
        <div className="login-container">
            <img src={logo} alt="logo" />
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
