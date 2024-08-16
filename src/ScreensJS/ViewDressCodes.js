import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import db from '../DB/firebase';
import { Button, ListGroup, ListGroupItem } from 'reactstrap';

const ViewDressCodes = () => {
    const [dressCodes, setDressCodes] = useState([]);

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

    return (
        <div>
            <h2>Dress Codes</h2>
            <ListGroup>
                {dressCodes.map(dressCode => (
                    <ListGroupItem key={dressCode.id}>
                        {dressCode.dressCode}
                        <Button close className="ml-2" onClick={() => handleDeleteDressCode(dressCode.id)} />
                    </ListGroupItem>
                ))}
            </ListGroup>
        </div>
    );
};

export default ViewDressCodes;
