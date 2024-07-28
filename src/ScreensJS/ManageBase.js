import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import db from '../DB/firebase';
import ViewEvents from '../components/ViewEvents'; // Import the ViewEvents component
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ManageBase.css';

const ManageBase = () => {
    const [activeTab, setActiveTab] = useState('1');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [timeStart, setTimeStart] = useState('');
    const [timeEnd, setTimeEnd] = useState('');
    const [mainArea, setMainArea] = useState('');
    const [specificPlace, setSpecificPlace] = useState('');
    const [recommendedAge, setRecommendedAge] = useState([]);
    const [dressCode, setDressCode] = useState('');
    const [image, setImage] = useState(null);
    const [registrantLimit, setRegistrantLimit] = useState('');

    const toggle = tab => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setRecommendedAge(prev =>
            checked ? [...prev, value] : prev.filter(age => age !== value)
        );
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = '';
            if (image) {
                const storage = getStorage();
                const storageRef = ref(storage, `event_images/${image.name}`);
                await uploadBytes(storageRef, image);
                imageUrl = await getDownloadURL(storageRef);
            }

            const docRef = await addDoc(collection(db, 'events'), {
                name,
                description,
                date,
                timeStart,
                timeEnd,
                location: {
                    mainArea,
                    specificPlace
                },
                characteristics: {
                    recommendedAge,
                    dressCode
                },
                imageUrl: imageUrl || '', // Save imageUrl if available
                registrantLimit: registrantLimit || null // Save registrantLimit if available
            });
            console.log("Document written with ID: ", docRef.id);
            // Reset form
            setName('');
            setDescription('');
            setDate('');
            setTimeStart('');
            setTimeEnd('');
            setMainArea('');
            setSpecificPlace('');
            setRecommendedAge([]);
            setDressCode('');
            setImage(null);
            setRegistrantLimit('');
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    const handleEdit = (id) => {
        console.log('Edit event with ID:', id);
        // Implement the logic to edit the event
    };

    const handleDelete = (id) => {
        console.log('Delete event with ID:', id);
        // Implement the logic to delete the event
    };

    const handleViewRegistrants = (id) => {
        console.log('View registrants for event with ID:', id);
        // Implement the logic to view the registrants
    };

    return (
        <div className="manage-base-container">
            <Nav tabs className="justify-content-center mb-4">
                <NavItem>
                    <NavLink
                        className={activeTab === '1' ? 'active' : ''}
                        onClick={() => toggle('1')}
                    >
                        View Events
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={activeTab === '2' ? 'active' : ''}
                        onClick={() => toggle('2')}
                    >
                        Add Event
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    <ViewEvents onEdit={handleEdit} onDelete={handleDelete} onViewRegistrants={handleViewRegistrants} />
                </TabPane>
                <TabPane tabId="2">
                    <h1>Add Event</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="eventName" className="form-label">Event Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="eventName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                id="description"
                                rows="3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="eventDate" className="form-label">Event Date</label>
                            <input
                                type="date"
                                className="form-control"
                                id="eventDate"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="timeStart" className="form-label">Start Time</label>
                            <input
                                type="time"
                                className="form-control"
                                id="timeStart"
                                value={timeStart}
                                onChange={(e) => setTimeStart(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="timeEnd" className="form-label">End Time</label>
                            <input
                                type="time"
                                className="form-control"
                                id="timeEnd"
                                value={timeEnd}
                                onChange={(e) => setTimeEnd(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="mainArea" className="form-label">Main Area</label>
                            <select
                                className="form-select"
                                id="mainArea"
                                value={mainArea}
                                onChange={(e) => setMainArea(e.target.value)}
                                required
                            >
                                <option value="">Select Main Area</option>
                                <option value="Area1">Area 1</option>
                                <option value="Area2">Area 2</option>
                                <option value="Area3">Area 3</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="specificPlace" className="form-label">Specific Place</label>
                            <select
                                className="form-select"
                                id="specificPlace"
                                value={specificPlace}
                                onChange={(e) => setSpecificPlace(e.target.value)}
                                required
                            >
                                <option value="">Select Specific Place</option>
                                <option value="Place1">Place 1</option>
                                <option value="Place2">Place 2</option>
                                <option value="Place3">Place 3</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Recommended Age</label>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="families"
                                    value="Families"
                                    checked={recommendedAge.includes('Families')}
                                    onChange={handleCheckboxChange}
                                />
                                <label className="form-check-label" htmlFor="families">Families</label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="seniors"
                                    value="Senior citizens"
                                    checked={recommendedAge.includes('Senior citizens')}
                                    onChange={handleCheckboxChange}
                                />
                                <label className="form-check-label" htmlFor="seniors">Senior citizens</label>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="dressCode" className="form-label">Dress Code</label>
                            <select
                                className="form-select"
                                id="dressCode"
                                value={dressCode}
                                onChange={(e) => setDressCode(e.target.value)}
                                required
                            >
                                <option value="">Select Dress Code</option>
                                <option value="Casual">Casual</option>
                                <option value="Formal">Formal</option>
                                <option value="Costume">Costume</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="eventImage" className="form-label">Event Image</label>
                            <input
                                type="file"
                                className="form-control"
                                id="eventImage"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="registrantLimit" className="form-label">Registrant Limit (Optional)</label>
                            <input
                                type="number"
                                className="form-control"
                                id="registrantLimit"
                                value={registrantLimit}
                                onChange={(e) => setRegistrantLimit(e.target.value)}
                                min="0"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Add Event</button>
                    </form>
                </TabPane>
            </TabContent>
        </div>
    );
};

export default ManageBase;
