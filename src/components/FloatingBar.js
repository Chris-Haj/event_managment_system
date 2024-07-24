import React, { useContext, useEffect, useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import AuthContext from '../context/AuthContext';
import db from '../DB/firebase'; // Import your Firestore instance
import './FloatingBar.css';

const FloatingBar = ({ toggleSidebar }) => {
    const { currentUser } = useContext(AuthContext);
    const [firstName, setFirstName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const auth = getAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFirstName(userData.firstName);
                    if (userData.role === 'admin') {
                        setIsAdmin(true);
                    }
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

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
                    <NavDropdown title={firstName || "User"} id="basic-nav-dropdown">
                        <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                        {isAdmin && <NavDropdown.Item as={Link} to="/event-options">EventOptions</NavDropdown.Item>}
                        <NavDropdown.Item onClick={handleSignOut}>Logout</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
            </Container>
        </Navbar>
    );
};

export default FloatingBar;
