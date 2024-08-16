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

    // Helper function to format the date as dd/mm/yyyy without extra leading zeros
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate(); // Day of the month without leading zero
        const month = date.getMonth() + 1; // Month (0-indexed, so +1)
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div>
            <h1 className="mb-4">Manage Events</h1>
            {events.length === 0 ? (
                <p>No events available.</p>
            ) : (
                <ul className="list-group">
                    {events.map(event => (
                        <li key={event.id} className="list-group-item d-flex justify-content-between align-items-center flex-column view-events">
                            <div className="event-details-name-date">
                                <h5 className="mb-1">{event.name}</h5>
                                <p className="mb-1">{formatDate(event.date)}</p>
                            </div>
                            <div className="event-buttons-edit-delete-view">
                                <button className="btn btn-primary me-2" onClick={() => onEdit(event.id)}>Edit</button>
                                <button className="btn btn-secondary view-registrants-btn" onClick={() => onViewRegistrants(event.id)}>View Registrants</button>
                                <button className="btn btn-danger me-2 event-buttons-delete" onClick={() => handleDelete(event.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewEvents;
