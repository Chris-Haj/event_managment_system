import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import db from '../DB/firebase';
import { Button, ListGroup, ListGroupItem } from 'reactstrap';

const ViewAges = () => {
    const [ages, setAges] = useState([]);

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

    return (
        <div>
            <h2>Recommended Age Ranges</h2>
            <ListGroup>
                {ages.map(age => (
                    <ListGroupItem key={age.id}>
                        {age.age}
                        <Button close className="ml-2" onClick={() => handleDeleteAge(age.id)} />
                    </ListGroupItem>
                ))}
            </ListGroup>
        </div>
    );
};

export default ViewAges;
