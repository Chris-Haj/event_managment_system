import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import db from '../DB/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Events.css';
import defaultLogo from '../Images/YovalimLogo.png'; // Import the default logo

const EventsPage = () => {
    const [events, setEvents] = useState([]);

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

    return (
        <div className="container mt-4 events-container">
            <h1 className="mb-4">Events</h1>
            {events.length === 0 ? (
                <p>No events available.</p>
            ) : (
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
                                <div className="card-body">
                                    <p className="card-text"><strong>Location:</strong> {event.location.mainArea}, {event.location.specificPlace}</p>
                                    <p className="card-text"><strong>Recommended Age:</strong> {event.characteristics.recommendedAge.join(', ')}</p>
                                    <p className="card-text"><strong>Dress Code:</strong> {event.characteristics.dressCode}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventsPage;
