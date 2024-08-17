import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import db from '../DB/firebase';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ViewRegistrants.css';
import { FaArrowLeft, FaDownload } from 'react-icons/fa'; // Icons for back and download

const ViewRegistrants = () => {
    const { eventId } = useParams();
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState({ mainArea: '', specificPlace: '' });
    const [registrants, setRegistrants] = useState([]);
    const [registrantsLimit, setRegistrantsLimit] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const eventDocRef = doc(db, 'events', eventId);
                const eventSnap = await getDoc(eventDocRef);

                if (eventSnap.exists()) {
                    const eventData = eventSnap.data();
                    setEventName(eventData.name);
                    setEventDate(eventData.date);
                    setEventLocation({
                        mainArea: eventData.location.mainArea,
                        specificPlace: eventData.location.specificPlace
                    });
                    setRegistrantsLimit(eventData.maxRegistrants || null);

                    // Fetch registrants details
                    const registrantsList = [];
                    for (const userId of eventData.registrants) {
                        const userDocRef = doc(db, 'users', userId);
                        const userSnap = await getDoc(userDocRef);
                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            registrantsList.push({
                                id: userId,
                                ...userData,
                                age: calculateAge(userData.birthDate) // Calculate age from birthdate
                            });
                        }
                    }
                    setRegistrants(registrantsList);
                }
            } catch (error) {
                console.error("Error fetching event data: ", error);
            }
        };

        fetchEventData();
    }, [eventId]);

    const calculateAge = (birthDate) => {
        if (!birthDate) return 'N/A';
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDifference = today.getMonth() - birth.getMonth();

        // Adjust if the birthdate hasn't occurred yet this year
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    const handleKickOut = async (userId) => {
        try {
            const eventDocRef = doc(db, 'events', eventId);
            await updateDoc(eventDocRef, {
                registrants: arrayRemove(userId)
            });

            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, {
                registeredEvents: arrayRemove(eventId)
            });

            setRegistrants(prevRegistrants =>
                prevRegistrants.filter(registrant => registrant.id !== userId)
            );
        } catch (error) {
            console.error("Error kicking out registrant: ", error);
        }
    };

    const downloadCSV = () => {
        const csvData = [
            ['Event Name', 'Date', 'Location', 'Area', 'Registrants Amount'],
            [
                eventName,
                eventDate,
                eventLocation.mainArea,
                eventLocation.specificPlace,
                registrantsLimit ? `${registrants.length}/${registrantsLimit}` : registrants.length
            ],
            [],
            ['First Name', 'Last Name', 'Email', 'Phone Number', 'Age'],
            ...registrants.map(registrant => [
                registrant.firstName,
                registrant.lastName,
                registrant.email,
                registrant.phoneNumber || 'N/A',
                registrant.age
            ])
        ];

        const csvContent = csvData.map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        const sanitizedEventName = eventName.replace(/[^a-zA-Z0-9]/g, '_');
        link.href = url;
        link.setAttribute('download', `${sanitizedEventName}_RegistrantsData.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container my-4 view-registrants">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <FaArrowLeft
                    className="back-arrow"
                    size={35}
                    onClick={() => navigate(-1)}
                    style={{ cursor: 'pointer' }}
                />
                <h1 className="text-center">
                    {eventName} - Registrants
                </h1>
                <FaDownload
                    className="download-icon"
                    size={35}
                    onClick={downloadCSV}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            {registrants.length > 0 ? (
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Age</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {registrants.map(registrant => (
                        <tr key={registrant.id}>
                            <td>{registrant.firstName} {registrant.lastName}</td>
                            <td>{registrant.email}</td>
                            <td>{registrant.phoneNumber || 'N/A'}</td>
                            <td>{registrant.age}</td>
                            <td>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleKickOut(registrant.id)}
                                >
                                    Kick Out
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No registrants for this event.</p>
            )}
        </div>
    );
};

export default ViewRegistrants;
