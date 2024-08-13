import React, {useEffect, useState, useContext} from 'react';
import {getDocs, collection, updateDoc, doc, arrayUnion, getDoc} from 'firebase/firestore';
import db from '../DB/firebase';
import './Events.css';
import defaultLogo from '../Images/YovalimLogo.png';
import {Modal, ModalHeader, ModalBody, ModalFooter, Button} from 'reactstrap';
import AuthContext from '../context/AuthContext'; // Import the AuthContext
import EventInfoModal from '../components/EventInfoModal'; // Import the EventInfoModal component

import {gapi} from 'gapi-script'; // Import gapi for Google API

const Events = () => {
    const {currentUser} = useContext(AuthContext); // Get the current user from the AuthContext
    const [events, setEvents] = useState([]);
    const [visibleDetails, setVisibleDetails] = useState({});
    const [modal, setModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(true); // Add loading state
    const [selectedEvent, setSelectedEvent] = useState(null); // Store selected event for EventInfoModal
    const [infoModalOpen, setInfoModalOpen] = useState(false); // State to control EventInfoModal

    const CLIENT_ID = process.env.REACT_APP_GOOGLE_CALENDER_CLIENT_ID;
    const API_KEY = process.env.REACT_APP_GOOGLE_CALENDER_API_KEY;

    useEffect(() => {
        const fetchEvents = async () => {
            const querySnapshot = await getDocs(collection(db, 'events'));
            const eventsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsList);
            setLoading(false); // Stop loading when events are fetched
        };

        fetchEvents();

        // Load the Google API client
        const initClient = () => {
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
                scope: "https://www.googleapis.com/auth/calendar.events"
            });
        };
        gapi.load('client:auth2', initClient);
    }, [API_KEY, CLIENT_ID]);

    const toggleModal = () => setModal(!modal);

    const toggleInfoModal = () => setInfoModalOpen(!infoModalOpen);

    const handleJoinEvent = async (id) => {
        if (!currentUser) {
            setModalMessage('You need to be logged in to join an event.');
            toggleModal();
            return;
        }

        try {
            const userId = currentUser.uid;
            const eventDoc = doc(db, 'events', id);
            const userDoc = doc(db, 'users', userId); // Reference to the user's document
            const eventSnap = await getDoc(eventDoc);

            if (eventSnap.exists()) {
                const eventData = eventSnap.data();
                if (eventData.registrants && eventData.registrants.includes(userId)) {
                    setModalMessage('You are already registered for this event.');
                    toggleModal();
                    return;
                }
            }

            // Update the event document: Add the user ID to the registrants array
            await updateDoc(eventDoc, {
                registrants: arrayUnion(userId)
            });

            // Update the user document: Add the event ID to the registeredEvents array
            await updateDoc(userDoc, {
                registeredEvents: arrayUnion(id)
            });

            // Add event to Google Calendar (if applicable)
            // addEventToGoogleCalendar(eventSnap.data());

            setModalMessage('Successfully registered for the event!');
            toggleModal();
        } catch (error) {
            setModalMessage(`Error joining event: ${error.message}`);
            toggleModal();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleInfoClick = (event) => {
        const formattedEvent = {...event, date: formatDate(event.date)};
        setSelectedEvent(formattedEvent);
        toggleInfoModal();
    };

    const addEventToGoogleCalendar = (event) => {
        const eventDetails = {
            'summary': event.name,
            'description': event.description,
            'start': {
                'dateTime': `${event.date}T${event.timeStart}:00`,
                'timeZone': 'America/Los_Angeles'
            },
            'end': {
                'dateTime': `${event.date}T${event.timeEnd}:00`,
                'timeZone': 'America/Los_Angeles'
            },
            'reminders': {
                'useDefault': false,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10}
                ]
            }
        };

        gapi.auth2.getAuthInstance().signIn().then(() => {
            const request = gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': eventDetails
            });

            request.execute((event) => {
                console.log('Event created: ', event.htmlLink);
            });
        });
    };

    if (loading) {
        return <div className="loading">Loading events...</div>; // Show loading spinner or message
    }

    return (
        <div className="events-container">
            <h1 className="Header">Current Events</h1>
            <div className="row">
                {events.map(event => (
                    <div key={event.id} className="col-md-4 mb-4">
                        <div className="card h-100 event-card">
                            <div className="card-header d-flex justify-content-between">
                                <h5 className="card-title">{event.name}</h5>
                                <div>
                                    <p className="card-text eventDate"><strong>{new Date(event.date).toLocaleDateString('en-GB')}</strong></p>
                                    <p className="card-text eventDate"><strong>{event.timeStart}-{event.timeEnd}</strong></p>
                                </div>
                            </div>
                            <img src={event.imageUrl || defaultLogo} className="card-img-top" alt="Event"/>
                            <div className="button-container">
                                <button
                                    className="btn btn-info info-button"
                                    onClick={() => handleInfoClick(event)}
                                >
                                    Info
                                </button>
                                <button
                                    className="btn btn-success join-button"
                                    onClick={() => handleJoinEvent(event.id)}
                                >
                                    Join
                                </button>
                            </div>
                            <div className={`card-footer event-details ${visibleDetails[event.id] ? 'eventDetailsShow' : 'eventDetailsHide'}`}>
                                <p><strong>Description:</strong> {event.description}</p>
                                <p><strong>Location:</strong> {event.location.mainArea}, {event.location.specificPlace}</p>
                                <p><strong>Recommended Age:</strong> {event.characteristics.recommendedAge.join(', ')}</p>
                                <p><strong>Dress Code:</strong> {event.characteristics.dressCode}</p>
                                {event.registrantLimit && (
                                    <p><strong>Registrant Cap:</strong> {event.registrantLimit}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Modal for Event Registration Confirmation */}
            <Modal isOpen={modal} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>Event Registration</ModalHeader>
                <ModalBody>
                    {modalMessage}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>Close</Button>
                </ModalFooter>
            </Modal>
            {/* Modal for Event Info */}
            <EventInfoModal isOpen={infoModalOpen} toggle={toggleInfoModal} event={selectedEvent}/>
        </div>
    );
};

export default Events;
