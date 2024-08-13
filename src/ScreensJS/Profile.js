import React, { useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import db from '../DB/firebase';
import AuthContext from '../context/AuthContext';
import './Profile.css';
import camIcon from '../Images/camIcon.png'; // Camera icon
import defaultProfilePic from '../Images/DefaultProfilePic.png'; // Default profile picture
import EventInfoModal from '../components/EventInfoModal'; // Import the EventInfoModal component

const Profile = () => {
    const { currentUser } = useContext(AuthContext);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [age, setAge] = useState(null);
    const [profilePic, setProfilePic] = useState(defaultProfilePic);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event
    const [infoModalOpen, setInfoModalOpen] = useState(false); // State to control EventInfoModal

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
                            eventsList.push({ id: eventId, ...eventSnap.data() });
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

    const toggleInfoModal = () => setInfoModalOpen(!infoModalOpen);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are zero-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleInfoClick = (event) => {
        const formattedEvent = { ...event, date: formatDate(event.date) };
        setSelectedEvent(formattedEvent);
        toggleInfoModal();
    };

    const handleLeaveEvent = async (eventId) => {
        if (!currentUser) return;

        try {
            const userId = currentUser.uid;
            const userDocRef = doc(db, 'users', userId);
            const eventDocRef = doc(db, 'events', eventId);

            // Remove the event from the user's registeredEvents array
            await updateDoc(userDocRef, {
                registeredEvents: arrayRemove(eventId)
            });

            // Remove the user from the event's registrants array
            await updateDoc(eventDocRef, {
                registrants: arrayRemove(userId)
            });

            // Update the local state to reflect the change
            setRegisteredEvents((prevEvents) =>
                prevEvents.filter((event) => event.id !== eventId)
            );
        } catch (error) {
            console.error("Error leaving event: ", error);
        }
    };

    return (
        <div className="profile-page-container">
            {/* Profile Section */}
            <div className="profile-container">
                <div className="profile-pic-container">
                    <img src={profilePic} alt="Profile" className="profile-pic" />
                </div>
                <button className="cam-icon-btn">
                    <img src={camIcon} alt="Change Profile Picture" />
                </button>

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
            <div className="registered-container">
                <h4>Registered Events</h4>
                {registeredEvents.length > 0 ? (
                    <ul className="registered-list">
                        {registeredEvents.slice(0, isExpanded ? registeredEvents.length : 3).map(event => (
                            <li key={event.id} className="registered-item">
                                <div className="registered-item-content">
                                    <strong>{event.name}</strong> - {formatDate(event.date)}
                                </div>
                                <div className="registered-item-buttons">
                                    <button
                                        className="btn btn-info info-button"
                                        onClick={() => handleInfoClick(event)}
                                    >
                                        Info
                                    </button>
                                    <button
                                        className="btn btn-danger leave-button"
                                        onClick={() => handleLeaveEvent(event.id)}
                                    >
                                        Leave Event
                                    </button>
                                </div>
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
            <EventInfoModal isOpen={infoModalOpen} toggle={toggleInfoModal} event={selectedEvent}/>
        </div>
    );
};

export default Profile;
