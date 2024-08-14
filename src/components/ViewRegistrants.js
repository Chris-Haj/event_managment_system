// ViewRegistrants.js
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import db from '../DB/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ViewRegistrants.css'; // You can create and style this CSS file as needed

const ViewRegistrants = () => {
    const { eventId } = useParams();
    const [eventName, setEventName] = useState('');
    const [registrants, setRegistrants] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const eventDocRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventDocRef);

                if (eventSnap.exists()) {
                    const eventData = eventSnap.data();
                    setEventName(eventData.name);

                    // Fetch registrants details
                    const registrantsList = [];
                    for (const userId of eventData.registrants) {
                        const userDocRef = doc(db, 'users', userId);
                        const userSnap = await getDoc(userDocRef);
                        if (userSnap.exists()) {
                            registrantsList.push({ id: userId, ...userSnap.data() });
                        }
                    }
                    setRegistrants(registrantsList);
                }
            } catch (error) {
                console.error("Error fetching event data: ", error);
            }
        };

        fetchEventData();
    }, [eventId]);

    const handleKickOut = async (userId) => {
        try {
            // Remove the user from the event's registrants array
            const eventDocRef = doc(db, 'events', eventId);
            await updateDoc(eventDocRef, {
                registrants: arrayRemove(userId)
            });

            // Remove the event from the user's registeredEvents array
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                registeredEvents: arrayRemove(eventId)
            });

            // Update the local state to reflect the change
            setRegistrants(prevRegistrants =>
                prevRegistrants.filter(registrant => registrant.id !== userId)
            );
        } catch (error) {
            console.error("Error kicking out registrant: ", error);
        }
    };

    return (
        <div className="view-registrants-container">
            <h1>{eventName} - Registrants</h1>
            {registrants.length > 0 ? (
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Contact Info</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {registrants.map(registrant => (
                        <tr key={registrant.id}>
                            <td>{registrant.firstName} {registrant.lastName}</td>
                            <td>{registrant.email}</td>
                            <td>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleKickOut(registrant.id)}
                                >
                                    Kick Out
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No registrants for this event.</p>
            )}
            <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>Back</button>
        </div>
    );
};

export default ViewRegistrants;
