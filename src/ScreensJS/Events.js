import React, { useEffect, useState, useContext } from 'react';
import { getDocs, collection, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import db from '../DB/firebase';
import './Events.css';
import defaultLogo from '../Images/YovalimLogo.png';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import AuthContext from '../context/AuthContext';
import EventInfoModal from '../components/EventInfoModal';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment); // Use moment.js as the localizer

const Events = () => {
    const { currentUser } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [modal, setModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [isCalendarView, setIsCalendarView] = useState(false); // State to control view mode
    const [filter, setFilter] = useState({
        startDate: '',
        endDate: '',
        location: '',
    });

    useEffect(() => {
        const fetchEvents = async () => {
            const querySnapshot = await getDocs(collection(db, 'events'));
            const eventsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                start: new Date(doc.data().date + ' ' + doc.data().timeStart), // Create start date object
                end: new Date(doc.data().date + ' ' + doc.data().timeEnd) // Create end date object
            }));
            setEvents(eventsList);
            setFilteredEvents(eventsList);
            setLoading(false);
        };

        fetchEvents();
    }, []);

    const toggleModal = () => setModal(!modal);
    const toggleInfoModal = () => setInfoModalOpen(!infoModalOpen);
    const toggleFilter = () => setFilterOpen(!filterOpen);
    const toggleViewMode = () => setIsCalendarView(!isCalendarView); // Toggle between calendar and list view

    const handleJoinEvent = async (id) => {
        if (!currentUser) {
            setModalMessage('You need to be logged in to join an event.');
            toggleModal();
            return;
        }

        try {
            const userId = currentUser.uid;
            const eventDoc = doc(db, 'events', id);
            const userDoc = doc(db, 'users', userId);
            const eventSnap = await getDoc(eventDoc);

            if (eventSnap.exists()) {
                const eventData = eventSnap.data();
                if (eventData.registrants && eventData.registrants.includes(userId)) {
                    setModalMessage('You are already registered for this event.');
                    toggleModal();
                    return;
                }
            }

            await updateDoc(eventDoc, {
                registrants: arrayUnion(userId)
            });

            await updateDoc(userDoc, {
                registeredEvents: arrayUnion(id)
            });

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
        const formattedEvent = { ...event, date: formatDate(event.date) };
        setSelectedEvent(formattedEvent);
        toggleInfoModal();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({ ...filter, [name]: value });
    };

    const applyFilters = () => {
        let filtered = events;

        if (filter.startDate) {
            filtered = filtered.filter(event => new Date(event.date) >= new Date(filter.startDate));
        }

        if (filter.endDate) {
            filtered = filtered.filter(event => new Date(event.date) <= new Date(filter.endDate));
        }

        if (filter.location) {
            filtered = filtered.filter(event =>
                event.location.mainArea.toLowerCase().includes(filter.location.toLowerCase()) ||
                event.location.specificPlace.toLowerCase().includes(filter.location.toLowerCase())
            );
        }

        setFilteredEvents(filtered);
    };

    const calendarEvents = filteredEvents.map(event => ({
        title: event.name,
        start: new Date(event.date + 'T' + event.timeStart),
        end: new Date(event.date + 'T' + event.timeEnd),
        id: event.id,
    }));

    if (loading) {
        return <div className="loading">Loading events...</div>;
    }

    return (
        <div className="events-container">
            <h1 className="Header">Current Events</h1>
            <div className="d-flex justify-content-between mb-3">
                <button className="btn btn-primary" onClick={toggleViewMode}>
                    {isCalendarView ? 'View List' : 'View Calendar'}
                </button>
                <button className="btn btn-secondary" onClick={toggleFilter}>
                    {filterOpen ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {filterOpen && (
                <div className="filter-container">
                    <div className="filter-group">
                        <label htmlFor="startDate">Start Date:</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={filter.startDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="endDate">End Date:</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={filter.endDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="location">Location:</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            placeholder="Enter location"
                            value={filter.location}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={applyFilters}>
                        Apply Filters
                    </button>
                </div>
            )}

            {isCalendarView ? (
                <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                />
            ) : (
                <div className="row">
                    {filteredEvents.map(event => (
                        <div key={event.id} className="col-md-4 mb-4">
                            <div className="card h-100 event-card">
                                <div className="card-header d-flex justify-content-between">
                                    <h5 className="card-title">{event.name}</h5>
                                    <div>
                                        <p className="card-text eventDate"><strong>{new Date(event.date).toLocaleDateString('en-GB')}</strong></p>
                                        <p className="card-text eventDate"><strong>{event.timeStart}-{event.timeEnd}</strong></p>
                                    </div>
                                </div>
                                <img src={event.imageUrl || defaultLogo} className="card-img-top" alt="Event" />
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
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={modal} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>Event Registration</ModalHeader>
                <ModalBody>{modalMessage}</ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>Close</Button>
                </ModalFooter>
            </Modal>

            <EventInfoModal isOpen={infoModalOpen} toggle={toggleInfoModal} event={selectedEvent} />
        </div>
    );
};

export default Events;
