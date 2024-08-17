import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import db from '../DB/firebase';
import { Button, ListGroup, ListGroupItem } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons'; // If using Bootstrap Icons

const ViewDressCodes = () => {
    const [dressCodes, setDressCodes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDressCodes();
    }, []);

    const fetchDressCodes = async () => {
        const dressCodesSnapshot = await getDocs(collection(db, 'eventDressCodes'));
        setDressCodes(dressCodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleDeleteDressCode = async (id) => {
        await deleteDoc(doc(db, 'eventDressCodes', id));
        fetchDressCodes(); // Refresh data after deletion
    };

    const handleBackClick = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className="Manage-Event-ViewFields">
            <div className="d-flex align-items-center mb-4">
                <Button color="link" onClick={handleBackClick} className="p-0 me-2">
                    <ArrowLeft size={45} /> {/* Back arrow icon with size 45 */}
                </Button>
                <h2>Dress Codes</h2>
            </div>
            <ListGroup>
                {dressCodes.map(dressCode => (
                    <ListGroupItem key={dressCode.id} className="d-flex justify-content-between align-items-center">
                        {dressCode.dressCode}
                        <Button close onClick={() => handleDeleteDressCode(dressCode.id)} />
                    </ListGroupItem>
                ))}
            </ListGroup>
        </div>
    );
};

export default ViewDressCodes;
