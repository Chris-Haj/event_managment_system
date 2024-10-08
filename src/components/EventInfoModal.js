import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import defaultLogo from '../Images/YovalimLogo.png';
import './EventInfoModal.css';

const EventInfoModal = ({ isOpen, toggle, event }) => {
    if (!event) return null; // If no event data, return nothing

    // Calculate the number of registrants and display the limit if it exists
    const registrantsCount = event.registrants ? event.registrants.length : 0;
    const registrantsInfo = event.registrantLimit
        ? `${registrantsCount} / ${event.registrantLimit}`
        : `${registrantsCount}`;

    return (
        <Modal isOpen={isOpen} toggle={toggle} centered>
            <ModalHeader toggle={toggle}>{event.name}</ModalHeader>
            <ModalBody>
                <img
                    src={event.imageUrl || defaultLogo}
                    alt="Event"
                    className="modal-event-img"
                />
                <p><strong>Description:</strong> {event.description}</p>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.timeStart} - {event.timeEnd}</p>
                <p><strong>Location:</strong> {event.location.mainArea}, {event.location.specificPlace}</p>
                <p><strong>Recommended Age:</strong> {event.characteristics.recommendedAge.join(', ')}</p>
                <p><strong>Dress Code:</strong> {event.characteristics.dressCode}</p>
                <p><strong>Registrants:</strong> {registrantsInfo}</p>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Close</Button>
            </ModalFooter>
        </Modal>
    );
};

export default EventInfoModal;
