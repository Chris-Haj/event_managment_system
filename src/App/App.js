import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from '../ScreensJS/AuthPage';
import EventsPage from '../ScreensJS/Events';
import AuthContext from '../context/AuthContext';

function App() {
    const { currentUser } = useContext(AuthContext);

    return (
        <Router>
            <Routes>
                <Route path="/" element={currentUser ? <Navigate replace to="/events" /> : <AuthPage />} />
                <Route path="/events" element={currentUser ? <EventsPage /> : <Navigate replace to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
