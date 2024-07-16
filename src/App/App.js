import React, { useState } from 'react';
import AuthPage from '../ScreensJS/AuthPage';
import EventsPage from '../ScreensJS/Events';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={isLoggedIn ? <Navigate replace to="/events" /> : <AuthPage onLogin={handleLogin} />} />
                <Route path="/events" element={isLoggedIn ? <EventsPage /> : <Navigate replace to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
