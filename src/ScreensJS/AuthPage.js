import React, { useRef, useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Form, FormGroup, Input, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AuthPage.css'; // Import custom CSS for additional styling
import logo from '../Images/YovalimLogo.png';
import db from '../DB/firebase'; // Ensure this is the correct path to your Firebase config

function SignIn({ email, setEmail, password, setPassword, handleLogin, setHasAccount }) {
    return (
        <div>
            <h2>Login</h2>
            <Form onSubmit={handleLogin}>
                <FormGroup>
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </FormGroup>
                <Button type="submit" color="primary" block>
                    Login
                </Button>
            </Form>
            <div className="text-center mt-3">
                Forgot password?
            </div>
            <div className="text-center mt-3">
                Don't have an account?{' '}
                <span className="sign-up-link" onClick={() => setHasAccount(false)}>
                    Sign up here
                </span>
            </div>
        </div>
    );
}

function SignUp({
                    email,
                    setEmail,
                    password,
                    setPassword,
                    confirmPassword,
                    setConfirmPassword,
                    handleSignUp,
                    setHasAccount,
                    firstName,
                    setFirstName,
                    lastName,
                    setLastName,
                    birthDate,
                    setBirthDate,
                }) {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]; // Get date 100 years ago in YYYY-MM-DD format
    const birthDateInputRef = useRef();

    // Placeholder logic using state
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    const handleFocus = () => {
        setShowPlaceholder(false); // Hide placeholder on focus
    };

    const handleBlur = () => {
        if (!birthDate) {
            setShowPlaceholder(true); // Show placeholder if no date is selected
        }
    };

    return (
        <div className='SignUp-Submission'>
            <h2>Sign Up</h2>
            <Form onSubmit={handleSignUp}>
                <FormGroup>
                    <p>First Name</p>
                    <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <p>Last Name</p>
                    <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup className="position-relative">
                    {/* Show placeholder if no date is selected */}
                    {(
                        <div
                            onClick={handleFocus}
                            className="birthdate-placeholder"
                        >
                            Birth Date
                        </div>
                    )}
                    <Input
                        type="date"
                        className="form-control"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        ref={birthDateInputRef}
                        max={currentDate}
                        min={minDate}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <p>Email</p>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <p>Password</p>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </FormGroup>
                <FormGroup>
                <p>Confirm Password</p>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </FormGroup>
                <Button type="submit" color="primary" block>
                    Sign Up
                </Button>
            </Form>
            <div className="text-center mt-3">
                Already have an account?{' '}
                <span className="sign-up-link" onClick={() => setHasAccount(true)}>
                    Login here
                </span>
            </div>
        </div>
    );
}

function AuthPage({ onLogin }) {
    const [hasAccount, setHasAccount] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [error, setError] = useState('');
    const auth = getAuth();

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, 'users', user.uid), {
                role: 'user',
                firstName,
                lastName,
                birthDate,
                email,
            });
            setHasAccount(true);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setFirstName('');
            setLastName('');
            setBirthDate('');
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
                // Redirect to admin dashboard or handle accordingly
            } else {
                console.log('User logged in');
                onLogin(); // Call onLogin to update login state
            }
        } catch (error) {
            setError(`Error: ${error.code} ${error.message}`);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4" style={{ width: '400px' }}>
                <img src={logo} alt="logo" className="mb-3 mx-auto d-block" style={{ width: '150px' }} />
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
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                        handleSignUp={handleSignUp}
                        setHasAccount={setHasAccount}
                        firstName={firstName}
                        setFirstName={setFirstName}
                        lastName={lastName}
                        setLastName={setLastName}
                        birthDate={birthDate}
                        setBirthDate={setBirthDate}
                    />
                )}
                {error && <p className="text-danger text-center">{error}</p>}
            </div>
        </div>
    );
}

export default AuthPage;
