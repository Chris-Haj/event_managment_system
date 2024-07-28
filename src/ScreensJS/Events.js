import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import db from '../DB/firebase';
import './Events.css';
import defaultLogo from '../Images/YovalimLogo.png';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [visibleDetails, setVisibleDetails] = useState({});

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
        try {
            const eventDoc = doc(db, 'events', id);
            // Add your logic here to update the event document to include the user as a registrant.
            // For example, you might have a field like "registrants" in your event document where you store user IDs.
            await updateDoc(eventDoc, {
                // Assuming there's a "registrants" field which is an array of user IDs
                // Replace `userId` with the actual ID of the user who is joining the event
                registrants: [/* userId */]
            });
            console.log(`User joined event with ID: ${id}`);
        } catch (error) {
            console.error("Error joining event: ", error);
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
                            <div className={`card-footer event-details ${visibleDetails[event.id] ? 'show' : ''}`} id={`details-${event.id}`}>
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
        </div>
    );
};

export default Events;
