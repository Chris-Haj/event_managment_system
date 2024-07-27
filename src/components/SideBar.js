import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import './SideBar.css';

const SideBar = ({ show, handleClose }) => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        handleClose();
        navigate(path);
    };

    return (
        <Offcanvas show={show} onHide={handleClose} placement="start">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Navigation</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <ul className="sidebar-list">
                    <li>
                        <button onClick={() => handleNavigation('/events')} className="sidebar-link">
                            Events
                        </button>
                    </li>
                    {/* Add more navigation links as needed */}
                </ul>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default SideBar;
