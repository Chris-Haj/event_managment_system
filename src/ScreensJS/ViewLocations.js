import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import db from '../DB/firebase';
import { Button, ListGroup, ListGroupItem } from 'reactstrap';

const ViewLocations = () => {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        const locationsSnapshot = await getDocs(collection(db, 'eventLocations'));
        setLocations(locationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleDeleteLocation = async (id) => {
        await deleteDoc(doc(db, 'eventLocations', id));
        fetchLocations(); // Refresh data after deletion
    };

    const handleDeleteArea = async (locationId, area) => {
        const locationDocRef = doc(db, 'eventLocations', locationId);
        const locationDoc = await locationDocRef.get();

        if (locationDoc.exists()) {
            const updatedAreas = locationDoc.data().areas.filter(a => a !== area);
            await updateDoc(locationDocRef, { areas: updatedAreas });
            fetchLocations(); // Refresh data after deletion
        }
    };

    return (
        <div>
            <h2>Locations and Areas</h2>
            <ListGroup>
                {locations.map(location => (
                    <div key={location.id}>
                        <h4>{location.name}</h4>
                        <ListGroup className="mb-3">
                            {location.areas.map(area => (
                                <ListGroupItem key={area}>
                                    {area}
                                    <Button close className="ml-2" onClick={() => handleDeleteArea(location.id, area)} />
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                        <Button color="danger" onClick={() => handleDeleteLocation(location.id)}>Delete Location</Button>
                    </div>
                ))}
            </ListGroup>
        </div>
    );
};

export default ViewLocations;
