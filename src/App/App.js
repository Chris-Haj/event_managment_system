import React, {useState} from 'react';
import LoginPage from '../ScreensJS/LoginPage.js'
import ViewEvents from '../ScreensJS/ViewEvents.js'
import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";

function App() {
    /*const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f7f7f7',
        },
        heading: {
            color: '#333',
        },
        paragraph: {
            maxWidth: '600px',
            textAlign: 'center',
            lineHeight: '1.5',
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Welcome to Our Event Platform</h1>
            <p style={styles.paragraph}>
                Explore and manage events effortlessly. Stay updated with the latest events, manage your schedules, and
                connect with others.
            </p>
        </div>
    );*/
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const handleLogin = () =>setIsLoggedIn(true);

    return (
        <Router>
            <Routes>
                <Route path="/" element={isLoggedIn ? <Navigate replace to="/posts" /> : <LoginPage onLogin={handleLogin} />} />
                <Route path="/posts" element={isLoggedIn ? <ViewEvents /> : <Navigate replace to="/" />} />
            </Routes>
        </Router>
    )

}



export default App;
