import React, {useState} from 'react';
import LoginPage from '../ScreensJS/LoginPage.js'
import ViewEvents from '../ScreensJS/ViewEvents.js'
import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";

function App() {

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
