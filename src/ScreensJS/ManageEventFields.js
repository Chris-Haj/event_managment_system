
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, getDoc } from 'firebase/firestore';
import db from '../DB/firebase';
import { Button, Input, Form, FormGroup, Label } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import ViewLocations from './ViewLocations'; // Import the ViewLocations component
import Ages from "./ViewAges";
import ViewDressCodes from "./ViewDressCodes";

const ManageEventFields = () => {
    const [locations, setLocations] = useState([]);
    const [ages, setAges] = useState([]);
    const [dressCodes, setDressCodes] = useState([]);

    const [newLocationName, setNewLocationName] = useState('');
    const [newArea, setNewArea] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    const [newAge, setNewAge] = useState('');
    const [newDressCode, setNewDressCode] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchEventFields();
    }, []);

    const fetchEventFields = async () => {
        const locationsSnapshot = await getDocs(collection(db, 'eventLocations'));
        const agesSnapshot = await getDocs(collection(db, 'eventAges'));
        const dressCodesSnapshot = await getDocs(collection(db, 'eventDressCodes'));

        setLocations(locationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setAges(agesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setDressCodes(dressCodesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleAddLocation = async () => {
        if (newLocationName.trim()) {
            const locationQuery = query(collection(db, 'eventLocations'), where('name', '==', newLocationName.trim()));
            const locationSnapshot = await getDocs(locationQuery);

            if (!locationSnapshot.empty) {
                alert(`Location "${newLocationName}" already exists.`);
                return;
            }

            await addDoc(collection(db, 'eventLocations'), { name: newLocationName.trim(), areas: [] });
            setNewLocationName('');
            fetchEventFields(); // Refresh data
            alert(`Location "${newLocationName}" added successfully.`);
        }
    };

    const handleAddArea = async () => {
        if (selectedLocation && newArea.trim()) {
            const locationDocRef = locations.find(location => location.id === selectedLocation);
            if (locationDocRef) {
                const locationData = locationDocRef;

                if (locationData.areas.includes(newArea.trim())) {
                    alert(`Area "${newArea}" already exists in ${locationData.name}.`);
                    return;
                }

                const updatedAreas = [...locationData.areas, newArea.trim()];
                await addDoc(collection(db, 'eventLocations', selectedLocation), { areas: updatedAreas });
                setNewArea('');
                fetchEventFields(); // Refresh data
                alert(`Area "${newArea}" added successfully to ${locationData.name}.`);
            }
        }
    };

    const handleAddAge = async () => {
        if (newAge.trim()) {
            const ageQuery = query(collection(db, 'eventAges'), where('age', '==', newAge.trim()));
            const ageSnapshot = await getDocs(ageQuery);

            if (!ageSnapshot.empty) {
                alert(`Age range "${newAge}" already exists.`);
                return;
            }

            await addDoc(collection(db, 'eventAges'), { age: newAge.trim() });
            setNewAge('');
            fetchEventFields(); // Refresh data
            alert(`Age range "${newAge}" added successfully.`);
        }
    };

    const handleAddDressCode = async () => {
        if (newDressCode.trim()) {
            const dressCodeQuery = query(collection(db, 'eventDressCodes'), where('dressCode', '==', newDressCode.trim()));
            const dressCodeSnapshot = await getDocs(dressCodeQuery);

            if (!dressCodeSnapshot.empty) {
                alert(`Dress code "${newDressCode}" already exists.`);
                return;
            }

            await addDoc(collection(db, 'eventDressCodes'), { dressCode: newDressCode.trim() });
            setNewDressCode('');
            fetchEventFields(); // Refresh data
            alert(`Dress code "${newDressCode}" added successfully.`);
        }
    };

    return (
        <div>
            <h2>Manage Event Fields</h2>

            {/* Locations (Cities and Areas) Management */}
            <h3>Locations (Cities and Areas)</h3>
            <Form inline className="mt-3" onSubmit={(e) => { e.preventDefault(); handleAddLocation(); }}>
                <FormGroup>
                    <Label for="newLocationName" className="mr-2">Add City:</Label>
                    <Input
                        type="text"
                        id="newLocationName"
                        value={newLocationName}
                        onChange={(e) => setNewLocationName(e.target.value)}
                    />
                </FormGroup>
                <Button type="submit" color="primary" className="ml-2">Add City</Button>
                <Button color="info" className="ml-2" onClick={() => navigate('/managedata/locations')}>View Locations</Button>
            </Form>

            <Form inline className="mt-3" onSubmit={(e) => { e.preventDefault(); handleAddArea(); }}>
                <FormGroup>
                    <Label for="selectedLocation" className="mr-2">Select City:</Label>
                    <Input
                        type="select"
                        id="selectedLocation"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                        <option value="">Select City</option>
                        {locations.map(location => (
                            <option key={location.id} value={location.id}>{location.name}</option>
                        ))}
                    </Input>
                </FormGroup>
                <FormGroup className="ml-3">
                    <Label for="newArea" className="mr-2">Add Area:</Label>
                    <Input
                        type="text"
                        id="newArea"
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                    />
                </FormGroup>
                <Button type="submit" color="primary" className="ml-2">Add Area</Button>
            </Form>

            {/* Recommended Ages Management */}
            <h3 className="mt-4">Recommended Ages</h3>
            <Form inline className="mt-3" onSubmit={(e) => { e.preventDefault(); handleAddAge(); }}>
                <FormGroup>
                    <Label for="newAge" className="mr-2">Add New:</Label>
                    <Input
                        type="text"
                        id="newAge"
                        value={newAge}
                        onChange={(e) => setNewAge(e.target.value)}
                    />
                </FormGroup>
                <Button type="submit" color="primary" className="ml-2">Add Age</Button>
                <Button color="info" className="ml-2" onClick={() => navigate('/managedata/age-ranges')}>View Age Ranges</Button>
            </Form>

            {/* Dress Codes Management */}
            <h3 className="mt-4">Dress Codes</h3>
            <Form inline className="mt-3" onSubmit={(e) => { e.preventDefault(); handleAddDressCode(); }}>
                <FormGroup>
                    <Label for="newDressCode" className="mr-2">Add New:</Label>
                    <Input
                        type="text"
                        id="newDressCode"
                        value={newDressCode}
                        onChange={(e) => setNewDressCode(e.target.value)}
                    />
                </FormGroup>
                <Button type="submit" color="primary" className="ml-2">Add Dress Code</Button>
                <Button color="info" className="ml-2" onClick={() => navigate('/managedata/dress-codes')}>View Dress Codes</Button>
            </Form>
        </div>
    );
};

export default ManageEventFields;
