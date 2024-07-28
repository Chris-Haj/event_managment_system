import React, { useEffect, useState, useContext } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import db from '../DB/firebase';
import './Events.css';
import defaultLogo from '../Images/YovalimLogo.png';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import AuthContext from '../context/AuthContext'; // Import the AuthContext

const Events = () => {
    const { currentUser } = useContext(AuthContext); // Get the current user from the AuthContext
    const [events, setEvents] = useState([]);
    const [visibleDetails, setVisibleDetails] = useState({});
    const [modal, setModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            const querySnapshot = await getDocs(collection(db, 'events'));
            const eventsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsList);
        };

        fetchEvents();
    }, []);

    const toggleDetails = (id) => {
        setVisibleDetails(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleJoinEvent = async (id) => {
        if (!currentUser) {
            setModalMessage('You need to be logged in to join an event.');
            setModal(true);
            return;
        }

        try {
            const userId = currentUser.uid;
            const eventDoc = doc(db, 'events', id);
            const eventSnap = await getDoc(eventDoc);

            if (eventSnap.exists()) {
                const eventData = eventSnap.data();
                if (eventData.registrants && eventData.registrants.includes(userId)) {
                    setModalMessage('You are already registered for this event.');
                    setModal(true);
                    return;
                }
            }

            await updateDoc(eventDoc, {
                registrants: arrayUnion(userId)
            });
            setModalMessage('Successfully registered for the event!');
            setModal(true);
        } catch (error) {
            setModalMessage(`Error joining event: ${error.message}`);
            setModal(true);
        }
    };

    return (
        <div className="events-container">
            <div className="row">
                {events.map(event => (
                    <div key={event.id} className="col-md-4 mb-4">
                        <div className="card h-100 event-card">
                            <div className="card-header d-flex justify-content-between">
                                <h5 className="card-title">{event.name}</h5>
                                <div>
                                    <p className="card-text"><strong>{event.date}</strong></p>
                                    <p className="card-text"><strong>{event.timeStart} - {event.timeEnd}</strong></p>
                                </div>
                            </div>
                            <img src={event.imageUrl || defaultLogo} className="card-img-top" alt="Event" />
                            <div className="button-container">
                                <button
                                    className="btn btn-info info-button"
                                    onClick={() => toggleDetails(event.id)}
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
                            {visibleDetails[event.id] && (
                                <div className="card-footer event-details">
                                    <p><strong>Description:</strong> {event.description}</p>
                                    <p><strong>Location:</strong> {event.location.mainArea}, {event.location.specificPlace}</p>
                                    <p><strong>Recommended Age:</strong> {event.characteristics.recommendedAge.join(', ')}</p>
                                    <p><strong>Dress Code:</strong> {event.characteristics.dressCode}</p>
                                    {event.registrantLimit && (
                                        <p><strong>Registrant Cap:</strong> {event.registrantLimit}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <Modal isOpen={modal} toggle={() => setModal(!modal)}>
                <ModalHeader toggle={() => setModal(!modal)}>Event Registration</ModalHeader>
                <ModalBody>
                    {modalMessage}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setModal(!modal)}>Close</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default Events;
