import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import db from '../DB/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';

const ViewEvents = ({ onEdit, onDelete, onViewRegistrants }) => {
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

    const handleDelete = async (id) => {
        await deleteDoc(doc(db, 'events', id));
        setEvents(events.filter(event => event.id !== id));
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Events</h1>
            {events.length === 0 ? (
                <p>No events available.</p>
            ) : (
                <ul className="list-group">
                    {events.map(event => (
                        <li key={event.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-1">{event.name}</h5>
                                <p className="mb-1">{event.date}</p>
                            </div>
                            <div>
                                <button className="btn btn-primary me-2" onClick={() => onEdit(event.id)}>Edit</button>
                                <button className="btn btn-danger me-2" onClick={() => handleDelete(event.id)}>Delete</button>
                                <button className="btn btn-secondary" onClick={() => onViewRegistrants(event.id)}>View Registrants</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewEvents;
