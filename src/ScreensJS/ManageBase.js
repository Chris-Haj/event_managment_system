import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import db from '../DB/firebase';
import './ManageBase.css';

const ManageBase = () => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [timeStart, setTimeStart] = useState('');
    const [timeEnd, setTimeEnd] = useState('');
    const [mainArea, setMainArea] = useState('');
    const [specificPlace, setSpecificPlace] = useState('');
    const [recommendedAge, setRecommendedAge] = useState([]);
    const [dressCode, setDressCode] = useState('');
    const [image, setImage] = useState(null);

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
        // Handle the image upload to Firebase Storage if required

        try {
            const docRef = await addDoc(collection(db, 'events'), {
                name,
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
                // Include the image URL if uploaded
            });
            console.log("Document written with ID: ", docRef.id);
            // Reset form
            setName('');
            setDate('');
            setTimeStart('');
            setTimeEnd('');
            setMainArea('');
            setSpecificPlace('');
            setRecommendedAge([]);
            setDressCode('');
            setImage(null);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    return (
        <div className="manage-base-container">
            <h1>ManageBase</h1>
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
                <button type="submit" className="btn btn-primary">Add Event</button>
            </form>
        </div>
    );
};

export default ManageBase;
