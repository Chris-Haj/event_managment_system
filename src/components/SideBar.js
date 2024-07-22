// src/components/SideBar.js

import React from 'react';
import { Offcanvas, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './SideBar.css';

const SideBar = ({ show, handleClose }) => {
    return (
        <Offcanvas show={show} onHide={handleClose} placement="start">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Nav className="flex-column">
                    <Nav.Link as={Link} to="/events">Events</Nav.Link>
                    <Nav.Link as={Link} to="/another-page">Another Page</Nav.Link>
                    {/* Add more links as needed */}
                </Nav>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default SideBar;
