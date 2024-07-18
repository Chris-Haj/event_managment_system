import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import mockEvents  from '../data/mockData';

const EventPost = ({ event }) => {
    return (
        <div className="card mb-3">
            <div className="card-body">
                <h5 className="card-title">{event.name}</h5>
                <p className="card-text"><strong>Date:</strong> {event.date}</p>
                <p className="card-text"><strong>Time:</strong> {event.time}</p>
                <p className="card-text"><strong>Main Area:</strong> {event.mainArea}</p>
                <p className="card-text"><strong>Specific Place:</strong> {event.specificPlace}</p>
                <p className="card-text"><strong>Recommended Ages:</strong> {event.recommendedAges.join(', ')}</p>
                <p className="card-text"><strong>Dress Code:</strong> {event.dressCode}</p>
                {event.permissions.requiresID && <p className="card-text"><strong>Permissions:</strong> ID Required</p>}
            </div>
        </div>
    );
};

const EventsPage = () => {
    const [events, setEvents] = useState(mockEvents);

    return (
        <div className="container mt-5">
            <h1>Upcoming Events</h1>
            {events.map((event) => (
                <div key={event.id}>
                    <EventPost event={event} />
                </div>
            ))}
        </div>
    );
};

export default EventsPage;
