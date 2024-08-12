import React, {useContext, useState, useEffect} from 'react';
import {doc, getDoc} from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import db from '../DB/firebase';
import AuthContext from '../context/AuthContext';
import './Profile.css';
import defaultProfilePic from '../Images/DefaultProfilePic.png'; // Ensure this is the correct path to your default profile picture

const Profile = () => {
    const {currentUser} = useContext(AuthContext);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [age, setAge] = useState(null);
    const [profilePic, setProfilePic] = useState(defaultProfilePic);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                const docRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setFirstName(userData.firstName);
                    setLastName(userData.lastName);
                    setBirthDate(userData.birthDate);
                    setEmail(userData.email);
                    setPhoneNumber(userData.phoneNumber || 'Not added');
                    setProfilePic(userData.profilePic || defaultProfilePic);

                    // Calculate age
                    const birthDateObj = new Date(userData.birthDate);
                    const today = new Date();
                    let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
                    const monthDiff = today.getMonth() - birthDateObj.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
                        calculatedAge--;
                    }
                    setAge(calculatedAge);

                    // Fetch events the user is registered for
                    const eventIds = userData.registeredEvents || [];
                    const eventsList = [];
                    for (const eventId of eventIds) {
                        const eventDocRef = doc(db, 'events', eventId);
                        const eventSnap = await getDoc(eventDocRef);
                        if (eventSnap.exists()) {
                            eventsList.push({id: eventId, ...eventSnap.data()});
                        }
                    }
                    setRegisteredEvents(eventsList);
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="profile-page-container">
            {/* Profile Section */}
            <div className="profile-container">
                <div className="profile-pic-container">
                    <img src={profilePic} alt="Profile" className="profile-pic"/>
                </div>
                <div className="profile-info-container">
                    <div className="profile-info">
                        <h4 className="user-header"><strong>My Profile:</strong></h4>
                        <h3>{firstName} {lastName}</h3>
                        <p><strong>Age:</strong> {age}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Phone Number:</strong> {phoneNumber}</p>
                        <button className="edit-profile-btn">Edit Profile</button>
                    </div>

                </div>

            </div>

            {/* Registered Events Section */}
            <div className="events-container">
                <h4>Registered Events</h4>
                {registeredEvents.length > 0 ? (
                    <ul className="events-list">
                        {registeredEvents.slice(0, isExpanded ? registeredEvents.length : 3).map(event => (
                            <li key={event.id} className="event-item">
                                <strong>{event.name}</strong> - {event.date}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No registered events yet.</p>
                )}
                {registeredEvents.length > 3 && (
                    <button onClick={toggleExpand} className="expand-btn">
                        {isExpanded ? 'Show Less' : 'View More'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;
