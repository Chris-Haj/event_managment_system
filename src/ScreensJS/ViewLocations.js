import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import db from '../DB/firebase';
import { Button, ListGroup, ListGroupItem, Collapse, Card, CardBody } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons'; // If using Bootstrap Icons

const ViewLocations = () => {
    const [locations, setLocations] = useState([]);
    const [expandedLocations, setExpandedLocations] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        const locationsSnapshot = await getDocs(collection(db, 'eventLocations'));
        setLocations(locationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const toggleExpandLocation = (locationId) => {
        setExpandedLocations((prevState) => ({
            ...prevState,
            [locationId]: !prevState[locationId],
        }));
    };

    const handleDeleteLocation = async (id) => {
        await deleteDoc(doc(db, 'eventLocations', id));
        fetchLocations(); // Refresh data after deletion
    };

    const handleDeleteArea = async (locationId, area) => {
        const locationDocRef = doc(db, 'eventLocations', locationId);
        const locationDoc = await getDoc(locationDocRef);

        if (locationDoc.exists()) {
            const updatedAreas = locationDoc.data().areas.filter((a) => a !== area);
            await updateDoc(locationDocRef, { areas: updatedAreas });
            fetchLocations(); // Refresh data after deletion
        }
    };

    const handleBackClick = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className="Manage-Event-ViewFields">
            <div className="d-flex align-items-center mb-4">
                <Button color="link" onClick={handleBackClick} className="p-0 me-2">
                    <ArrowLeft size={45} /> {/* Back arrow icon */}
                </Button>
                <h2>Locations and Areas</h2>
            </div>

            <ListGroup>
                {locations.map((location) => (
                    <Card key={location.id} className="mb-3">
                        <CardBody>
                            <div className="d-flex justify-content-between align-items-center">
                                <h4>{location.name}</h4>
                                <div className='d-flex flex-column'>
                                    <Button color="primary" onClick={() => toggleExpandLocation(location.id)}>
                                        {expandedLocations[location.id] ? 'Hide Areas' : 'View Areas'}
                                    </Button>
                                    <Button color="danger" className="mt-3" onClick={() => handleDeleteLocation(location.id)}>
                                        Delete Location
                                    </Button>
                                </div>
                            </div>
                            <Collapse isOpen={expandedLocations[location.id]}>
                                <ListGroup className="mt-3">
                                    {location.areas.map((area) => (
                                        <ListGroupItem key={area} className="d-flex justify-content-between align-items-center">
                                            {area}
                                            <Button close onClick={() => handleDeleteArea(location.id, area)} />
                                        </ListGroupItem>
                                    ))}
                                </ListGroup>
                            </Collapse>
                        </CardBody>
                    </Card>
                ))}
            </ListGroup>
        </div>
    );
};

export default ViewLocations;
