import React, {useState} from 'react';
import LoginPage from '../ScreensJS/LoginPage.js'
import ViewEvents from '../ScreensJS/ViewEvents.js'
import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";

function App() {


    return (
        <div>
            <h1>Welcome to Our Event Platform</h1>
            <p>
                Explore and manage events effortlessly. Stay updated with the latest events, manage your schedules, and
                connect with others.
            </p>
        </div>
    );
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
