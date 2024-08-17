import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import db from '../DB/firebase';
import { Button, ListGroup, ListGroupItem } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons'; // If using Bootstrap Icons

const ViewAges = () => {
    const [ages, setAges] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAges();
    }, []);

    const fetchAges = async () => {
        const agesSnapshot = await getDocs(collection(db, 'eventAges'));
        setAges(agesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleDeleteAge = async (id) => {
        await deleteDoc(doc(db, 'eventAges', id));
        fetchAges(); // Refresh data after deletion
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
                <h2>Recommended Age Ranges</h2>
            </div>
            <ListGroup>
                {ages.map(age => (
                    <ListGroupItem key={age.id} className="d-flex justify-content-between align-items-center">
                        {age.age}

                        <Button close onClick={() => handleDeleteAge(age.id)} />
                    </ListGroupItem>
                ))}
            </ListGroup>
        </div>
    );
};

export default ViewAges;
