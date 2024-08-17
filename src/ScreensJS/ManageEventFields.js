import React, { useState, useEffect } from 'react';
import { getDocs, getDoc, collection, addDoc, updateDoc, query, where, onSnapshot, doc } from 'firebase/firestore';
import db from '../DB/firebase';
import { Button, Input, Form, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const ManageEventFields = () => {
    const [locations, setLocations] = useState([]);
    const [ages, setAges] = useState([]);
    const [dressCodes, setDressCodes] = useState([]);

    const [newLocationNames, setNewLocationNames] = useState('');
    const [newAreas, setNewAreas] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    const [newAges, setNewAges] = useState('');
    const [newDressCodes, setNewDressCodes] = useState('');

    const [modal, setModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeLocations = onSnapshot(collection(db, 'eventLocations'), (snapshot) => {
            setLocations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubscribeAges = onSnapshot(collection(db, 'eventAges'), (snapshot) => {
            setAges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubscribeDressCodes = onSnapshot(collection(db, 'eventDressCodes'), (snapshot) => {
            setDressCodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubscribeLocations();
            unsubscribeAges();
            unsubscribeDressCodes();
        };
    }, []);

    const toggleModal = () => setModal(!modal);

    const showModalMessage = (message) => {
        setModalMessage(message);
        toggleModal();
    };

    // Function to add multiple locations
    const handleAddLocations = async () => {
        const locationNames = newLocationNames.split(',').map(name => name.trim()).filter(name => name);

        for (let locationName of locationNames) {
            const locationQuery = query(collection(db, 'eventLocations'), where('name', '==', locationName));
            const locationSnapshot = await getDocs(locationQuery);

            if (locationSnapshot.empty) {
                await addDoc(collection(db, 'eventLocations'), { name: locationName, areas: [] });
            } else {
                showModalMessage(`Location "${locationName}" already exists.`);
                return;
            }
        }

        setNewLocationNames(''); // Clear input
        showModalMessage(`Locations "${locationNames.join(', ')}" added successfully.`);
    };

    // Function to add multiple areas to a selected location
    const handleAddAreas = async () => {
        if (selectedLocation && newAreas.trim()) {
            const locationDocRef = doc(db, 'eventLocations', selectedLocation);
            const locationDoc = await getDoc(locationDocRef);

            if (locationDoc.exists()) {
                const locationData = locationDoc.data();
                const areaNames = newAreas.split(',').map(area => area.trim()).filter(area => area);

                const updatedAreas = [...locationData.areas, ...areaNames.filter(area => !locationData.areas.includes(area))];
                await updateDoc(locationDocRef, { areas: updatedAreas });

                setNewAreas(''); // Clear input
                showModalMessage(`Areas "${areaNames.join(', ')}" added successfully to ${locationData.name}.`);
            }
        }
    };

    // Function to add multiple ages
    const handleAddAges = async () => {
        const ageRanges = newAges.split(',').map(age => age.trim()).filter(age => age);

        for (let ageRange of ageRanges) {
            const ageQuery = query(collection(db, 'eventAges'), where('age', '==', ageRange));
            const ageSnapshot = await getDocs(ageQuery);

            if (ageSnapshot.empty) {
                await addDoc(collection(db, 'eventAges'), { age: ageRange });
            } else {
                showModalMessage(`Age range "${ageRange}" already exists.`);
                return;
            }
        }

        setNewAges(''); // Clear input
        showModalMessage(`Age ranges "${ageRanges.join(', ')}" added successfully.`);
    };

    // Function to add multiple dress codes
    const handleAddDressCodes = async () => {
        const dressCodes = newDressCodes.split(',').map(dressCode => dressCode.trim()).filter(dressCode => dressCode);

        for (let dressCode of dressCodes) {
            const dressCodeQuery = query(collection(db, 'eventDressCodes'), where('dressCode', '==', dressCode));
            const dressCodeSnapshot = await getDocs(dressCodeQuery);

            if (dressCodeSnapshot.empty) {
                await addDoc(collection(db, 'eventDressCodes'), { dressCode });
            } else {
                showModalMessage(`Dress code "${dressCode}" already exists.`);
                return;
            }
        }

        setNewDressCodes(''); // Clear input
        showModalMessage(`Dress codes "${dressCodes.join(', ')}" added successfully.`);
    };

    return (
        <div className="Manage-Event-Fields">
            <h2>Manage Event Fields</h2>
            {/* Locations (Cities and Areas) Management */}
            <h3>Locations (Cities and Areas)</h3>
            <Form inline className="mt-3" onSubmit={(e) => { e.preventDefault(); handleAddLocations(); }}>
                <FormGroup>
                    <Label for="newLocationNames" className="mr-2">Add Locations/Cities:</Label>
                    <Input
                        type="text"
                        id="newLocationNames"
                        value={newLocationNames}
                        onChange={(e) => setNewLocationNames(e.target.value)}
                        placeholder="Enter locations separated by commas (example: Jerusalem, Tel Aviv)"
                    />
                </FormGroup>
                <Button type="submit" color="primary" className="ml-2">Add Locations</Button>
                <Button color="info" className="ml-2" onClick={() => navigate('/manage-data/locations')}>View Locations</Button>
            </Form>

            <Form inline className="mt-3" onSubmit={(e) => { e.preventDefault(); handleAddAreas(); }}>
                <FormGroup>
                    <Label for="selectedLocation" className="mr-2">Select Location/City:</Label>
                    <Input
                        type="select"
                        id="selectedLocation"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                        <option value="">Select Location/City</option>
                        {locations.map(location => (
                            <option key={location.id} value={location.id}>{location.name}</option>
                        ))}
                    </Input>
                </FormGroup>
                <FormGroup className="ml-3">
                    <Label for="newAreas" className="mr-2">Add Area/s:</Label>
                    <Input
                        type="text"
                        id="newAreas"
                        value={newAreas}
                        onChange={(e) => setNewAreas(e.target.value)}
                        placeholder="Enter areas separated by commas"
                    />
                </FormGroup>
                <Button type="submit" color="primary" className="ml-2">Add Areas</Button>
            </Form>

            {/* Recommended Ages Management */}
            <h3 className="mt-4">Recommended Ages</h3>
            <Form inline className="mt-3" onSubmit={(e) => { e.preventDefault(); handleAddAges(); }}>
                <FormGroup>
                    <Label for="newAges" className="mr-2">Add New Age Range/s:</Label>
                    <Input
                        type="text"
                        id="newAges"
                        value={newAges}
                        onChange={(e) => setNewAges(e.target.value)}
                        placeholder="Enter age ranges separated by commas"
                    />
                </FormGroup>
                <Button type="submit" color="primary" className="ml-2">Add Age Ranges</Button>
                <Button color="info" className="ml-2" onClick={() => navigate('/manage-data/age-ranges')}>View Age Ranges</Button>
            </Form>

            {/* Dress Codes Management */}
            <h3 className="mt-4">Dress Codes</h3>
            <Form inline className="mt-3" onSubmit={(e) => { e.preventDefault(); handleAddDressCodes(); }}>
                <FormGroup>
                    <Label for="newDressCodes" className="mr-2">Add New Dress Codes:</Label>
                    <Input
                        type="text"
                        id="newDressCodes"
                        value={newDressCodes}
                        onChange={(e) => setNewDressCodes(e.target.value)}
                        placeholder="Enter dress codes separated by commas"
                    />
                </FormGroup>
                <Button type="submit" color="primary" className="ml-2">Add Dress Code/s</Button>
                <Button color="info" className="ml-2" onClick={() => navigate('/manage-data/dress-codes')}>View Dress Codes</Button>
            </Form>

            {/* Modal for Success Messages */}
            <Modal isOpen={modal} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>Success</ModalHeader>
                <ModalBody>{modalMessage}</ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggleModal}>Close</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ManageEventFields;
