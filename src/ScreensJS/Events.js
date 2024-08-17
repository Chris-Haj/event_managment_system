import React, {useEffect, useState, useContext} from 'react';
import {getDocs, collection, updateDoc, doc, arrayUnion, getDoc} from 'firebase/firestore';
import db from '../DB/firebase';
import './Events.css';
import defaultLogo from '../Images/YovalimLogo.png';
import {Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner} from 'reactstrap';
import AuthContext from '../context/AuthContext';
import EventInfoModal from '../components/EventInfoModal';
import {Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {addEventToGoogleCalendar, initGoogleCalendarClient} from "../utils/GoogleCalendar";

const localizer = momentLocalizer(moment);

const Events = () => {
    const {currentUser} = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [showCalendarButton, setShowCalendarButton] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [modal, setModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [isCalendarView, setIsCalendarView] = useState(false);
    const [filter, setFilter] = useState({
        startDate: '',
        endDate: '',
        location: '',
    });
    const [selectedDateEvents, setSelectedDateEvents] = useState([]); // State for selected date events
    const [selectedDate, setSelectedDate] = useState(null); // State for selected date


    useEffect(() => {
        const fetchEvents = async () => {
            const querySnapshot = await getDocs(collection(db, 'events'));
            const eventsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                start: new Date(doc.data().date + ' ' + doc.data().timeStart),
                end: new Date(doc.data().date + ' ' + doc.data().timeEnd)
            }));
            setEvents(eventsList);
            setFilteredEvents(eventsList);
            setLoading(false);

        };

        fetchEvents();
        initGoogleCalendarClient();
    }, []);

    const toggleModal = () => setModal(!modal);
    const toggleInfoModal = () => setInfoModalOpen(!infoModalOpen);
    const toggleFilter = () => setFilterOpen(!filterOpen);
    const toggleViewMode = () => setIsCalendarView(!isCalendarView);

    const handleJoinEvent = async (id) => {
        if (!currentUser) {
            setModalMessage('You need to be logged in to join an event.');
            toggleModal();
            return;
        }


        setModalMessage('Registering for the event...');
        toggleModal();

        try {
            const userId = currentUser.uid;
            const eventDoc = doc(db, 'events', id);
            const userDoc = doc(db, 'users', userId);
            const eventSnap = await getDoc(eventDoc);

            if (eventSnap.exists()) {
                const eventData = eventSnap.data();
                const registrants = eventData.registrants || [];
                const waitingList = eventData.waitingList || [];
                if (eventData.registrants && eventData.registrants.includes(userId)) {
                    setLoading(false);
                    setModalMessage('You are already registered for this event.');
                    return;
                }

                if (registrants.length >= eventData.registrantLimit) {
                    if (waitingList.includes(userId)) {
                        setLoading(false);
                        setModalMessage('You are already on the waiting list for this event.');
                        return;
                    }
                    await updateDoc(eventDoc, {
                        waitingList: arrayUnion(userId)
                    });
                    setLoading(false);
                    setModalMessage('You have been added to the waiting list for this event.');
                } else {
                    await updateDoc(eventDoc, {
                        registrants: arrayUnion(userId)
                    });

                    await updateDoc(userDoc, {
                        registeredEvents: arrayUnion(id)
                    });

                    setSelectedEvent(eventData); // Store event data for Google Calendar
                    setLoading(false);
                    setModalMessage('Successfully registered for the event!');
                    setShowCalendarButton(true); // Show "Add to Calendar" button
                }
            }
        } catch (error) {
            setLoading(false);
            setModalMessage(`Error joining event: ${error.message}`);
        }
    };

    const handleAddToGoogleCalendar = () => {
        if (selectedEvent) {
            addEventToGoogleCalendar(selectedEvent);
            setModalMessage('Event added to Google Calendar.');
            setShowCalendarButton(false);
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

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilter({...filter, [name]: value});
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

    const handleDateClick = (slotInfo) => {
        const clickedDate = new Date(slotInfo.start).toDateString();
        const eventsForDate = filteredEvents.filter(event => new Date(event.date).toDateString() === clickedDate);

        setSelectedDateEvents(eventsForDate);
        setSelectedDate(clickedDate);
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
                <button className="btn btn-primary view-toggle-btn" onClick={toggleViewMode}>
                    {isCalendarView ? 'View List' : 'View Calendar'}
                </button>
                <button className="btn btn-secondary filter-toggle-btn" onClick={toggleFilter}>
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
                    <button className="btn btn-primary apply-filters-btn" onClick={applyFilters}>
                        Apply Filters
                    </button>
                </div>
            )}

            {isCalendarView ? (
                <div>
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{height: 500}}
                        className="event-calendar"
                        selectable
                        onSelectSlot={handleDateClick} // Handle date clicks
                    />
                    {selectedDate && (
                        <div className="selected-date-events">
                            {selectedDateEvents.length > 0 ? (
                                <div>
                                    <h3>Events on {selectedDate}:</h3>
                                    <div className="row">
                                        {selectedDateEvents.map(event => (
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <h3>No events on {new Date(selectedDate).toLocaleDateString('en-GB')}</h3>
                            )}
                        </div>
                    )}
                </div>
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
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={modal} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>Event Registration</ModalHeader>
                <ModalBody>
                    {loading ? (
                        <div className="text-center">
                            <Spinner color="primary"/>
                            <p>{modalMessage}</p>
                        </div>
                    ) : (
                        <p>{modalMessage}</p>
                    )}
                </ModalBody>
                <ModalFooter>
                    {showCalendarButton && (
                        <Button color="success" onClick={handleAddToGoogleCalendar}>
                            Add to Calendar
                        </Button>
                    )}
                    <Button color="secondary" onClick={toggleModal}>Close</Button>
                </ModalFooter>
            </Modal>

            <EventInfoModal isOpen={infoModalOpen} toggle={toggleInfoModal} event={selectedEvent}/>
        </div>
    );
};

export default Events;
