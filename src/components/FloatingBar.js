import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import AuthContext from '../context/AuthContext';
import './FloatingBar.css';

const FloatingBar = ({ toggleSidebar }) => {
    const { currentUser } = useContext(AuthContext);
    const auth = getAuth();

    const handleSignOut = () => {
        signOut(auth).then(() => {
            console.log('User signed out');
        }).catch((error) => {
            console.error('Error signing out: ', error);
        });
    };

    return (
        <Navbar bg="light" variant="light" fixed="top" className="floating-bar">
            <Container fluid>
                <Navbar.Brand onClick={toggleSidebar} className="cursor-pointer">
                    <FaBars size={20} />
                </Navbar.Brand>
                <Nav className="ml-auto">
                    <NavDropdown title={currentUser?.displayName || "User"} id="basic-nav-dropdown">
                        <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                        <NavDropdown.Item onClick={handleSignOut}>Logout</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default FloatingBar;
