import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from '../ScreensJS/AuthPage';
import EventsPage from '../ScreensJS/Events';
import AuthContext from '../context/AuthContext';
import FloatingBar from '../components/FloatingBar';
import SideBar from '../components/SideBar';
import EventOptions from "../ScreensJS/EventOptions";

function App() {
    const { currentUser } = useContext(AuthContext);
    const [sidebarShow, setSidebarShow] = useState(false);

    const toggleSidebar = () => setSidebarShow(!sidebarShow);

    console.log('Current user:', currentUser); // Debug log

    return (
        <Router>
            {currentUser && <FloatingBar toggleSidebar={toggleSidebar} />}
            <SideBar show={sidebarShow} handleClose={toggleSidebar} />
            <Routes>
                <Route path="/" element={currentUser ? <Navigate replace to="/events" /> : <AuthPage />} />
                <Route path="/events" element={currentUser ? <EventsPage /> : <Navigate replace to="/" />} />
                <Route path="/event-options" element={currentUser && currentUser.role === 'admin' ? <EventOptions /> : <Navigate replace to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
