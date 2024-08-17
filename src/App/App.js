import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from '../ScreensJS/AuthPage';
import EventsPage from '../ScreensJS/Events';
import ManageBase from '../ScreensJS/ManageBase';
import AuthContext from '../context/AuthContext';
import FloatingBar from '../components/FloatingBar';
import SideBar from '../components/SideBar';
import Profile from '../ScreensJS/Profile';
import ViewRegistrants from '../components/ViewRegistrants'; // Import the ViewRegistrants component
import ViewLocations from '../ScreensJS/ViewLocations';
import ViewAges from '../ScreensJS/ViewAges';
import ViewDressCodes from '../ScreensJS/ViewDressCodes';

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
                <Route path="/profile" element={currentUser ? <Profile /> : <Navigate replace to="/" />} />
                <Route path="/manage-base" element={currentUser && currentUser.role === 'admin' ? <ManageBase /> : <Navigate replace to="/" />} />
                <Route path="/view-registrants/:eventId" element={<ViewRegistrants />} />
                <Route path="/manage-data/locations" element={<ViewLocations />} />
                <Route path="/manage-data/age-ranges" element={<ViewAges />} />
                <Route path="/manage-data/dress-codes" element={<ViewDressCodes />} />
            </Routes>
        </Router>
    );
}

export default App;
