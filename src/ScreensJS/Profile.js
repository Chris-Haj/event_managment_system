import React, {useContext, useState, useEffect} from 'react';
import {doc, getDoc, updateDoc, arrayRemove, arrayUnion} from 'firebase/firestore';
import {getStorage, ref, deleteObject, uploadBytes, getDownloadURL} from 'firebase/storage';
import 'bootstrap/dist/css/bootstrap.min.css';
import db from '../DB/firebase';
import AuthContext from '../context/AuthContext';
import './Profile.css';
import camIcon from '../Images/camIcon.png'; // Camera icon
import defaultProfilePic from '../Images/DefaultProfilePic.png'; // Default profile picture
import EventInfoModal from '../components/EventInfoModal'; // Import the EventInfoModal component
import {Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input} from 'reactstrap';

const Profile = () => {
    const {currentUser} = useContext(AuthContext);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [age, setAge] = useState(null);
    const [profilePic, setProfilePic] = useState(defaultProfilePic);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event
    const [infoModalOpen, setInfoModalOpen] = useState(false); // State to control EventInfoModal
    const [editProfileModal, setEditProfileModal] = useState(false); // State for edit profile modal
    const [profilePicModalOpen, setProfilePicModalOpen] = useState(false); // State for profile picture change modal
    const [preview, setPreview] = useState(defaultProfilePic); // State for previewing new profile pic
    const [newPicFile, setNewPicFile] = useState(null); // State for storing the new profile picture file

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                const docRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setFirstName(userData.firstName);
                    setLastName(userData.lastName);
                    setBirthDate(userData.birthDate);
                    setEmail(userData.email);
                    setPhoneNumber(userData.phoneNumber || 'Not added');
                    setProfilePic(userData.profilePic || defaultProfilePic);
                    setPreview(userData.profilePic || defaultProfilePic);

                    // Calculate age
                    const birthDateObj = new Date(userData.birthDate);
                    const today = new Date();
                    let calculatedAge = today.getFullYear() - birthDateObj.getFullYear();
                    const monthDiff = today.getMonth() - birthDateObj.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
                        calculatedAge--;
                    }
                    setAge(calculatedAge);

                    // Fetch events the user is registered for
                    const eventIds = userData.registeredEvents || [];
                    const eventsList = [];
                    for (const eventId of eventIds) {
                        const eventDocRef = doc(db, 'events', eventId);
                        const eventSnap = await getDoc(eventDocRef);
                        if (eventSnap.exists()) {
                            eventsList.push({id: eventId, ...eventSnap.data()});
                        }
                    }
                    setRegisteredEvents(eventsList);
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const toggleInfoModal = () => setInfoModalOpen(!infoModalOpen);
    const toggleEditProfileModal = () => setEditProfileModal(!editProfileModal);
    const toggleProfilePicModal = () => {
        setNewPicFile(null); // Clear selected file
        setPreview(profilePic); // Reset the preview to the current profile picture
        setProfilePicModalOpen(!profilePicModalOpen);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are zero-indexed
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleInfoClick = (event) => {
        const formattedEvent = {...event, date: formatDate(event.date)};
        setSelectedEvent(formattedEvent);
        toggleInfoModal();
    };

    const handleLeaveEvent = async (eventId) => {
        if (!currentUser) return;

        try {
            const userId = currentUser.uid;
            const userDocRef = doc(db, 'users', userId);
            const eventDocRef = doc(db, 'events', eventId);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const registrants = eventData.registrants || [];
                const waitingList = eventData.waitingList || [];

                // Remove the event from the user's registeredEvents array
                await updateDoc(userDocRef, {
                    registeredEvents: arrayRemove(eventId)
                });

                // Remove the user from the event's registrants array
                await updateDoc(eventDocRef, {
                    registrants: arrayRemove(userId)
                });

                // If there's a waiting list, move the first person to the registrants
                if (waitingList.length > 0) {
                    const nextInLine = waitingList[0]; // Get the first person in the waiting list

                    // Add the first person from the waiting list to the registrants array
                    await updateDoc(eventDocRef, {
                        registrants: arrayUnion(nextInLine),
                        waitingList: arrayRemove(nextInLine) // Remove them from the waiting list
                    });

                    // Update the user's registeredEvents array to reflect their registration
                    const nextUserDocRef = doc(db, 'users', nextInLine);
                    await updateDoc(nextUserDocRef, {
                        registeredEvents: arrayUnion(eventId)
                    });
                }

                // Update the local state to reflect the change
                setRegisteredEvents((prevEvents) =>
                    prevEvents.filter((event) => event.id !== eventId)
                );
            }
        } catch (error) {
            console.error("Error leaving event: ", error);
        }
    };


    const handleProfilePicChange = (e) => {
        if (e.target.files[0]) {
            setNewPicFile(e.target.files[0]); // Store the new file
            setPreview(URL.createObjectURL(e.target.files[0])); // Preview the new picture
        }
    };

    const saveProfilePic = async () => {
        if (newPicFile) {
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const storage = getStorage();
                const fileRef = ref(storage, `profile_pictures/${currentUser.uid}_${newPicFile.name}`);

                // Check if the user has an existing profile picture
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (userData.profilePic) {
                        // Delete the previous profile picture from Firebase Storage
                        const oldProfilePicRef = ref(storage, userData.profilePic);
                        await deleteObject(oldProfilePicRef);
                    }
                }

                // Upload the new profile picture
                await uploadBytes(fileRef, newPicFile);

                // Get the new profile picture URL
                const newProfilePicUrl = await getDownloadURL(fileRef);

                // Update the user's profile picture in Firestore
                await updateDoc(userDocRef, {
                    profilePic: newProfilePicUrl
                });

                // Set the new profile picture
                setProfilePic(newProfilePicUrl);
                toggleProfilePicModal(); // Close the modal after updating
            } catch (error) {
                console.error("Error updating profile picture: ", error);
            }
        }
    };

    const handleEditProfile = async () => {
        if (!currentUser) return;

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);

            // Update the user's document with new fields
            await updateDoc(userDocRef, {
                email,
                phoneNumber
            });

            toggleEditProfileModal();
        } catch (error) {
            console.error("Error updating profile: ", error);
        }
    };

    return (
        <div className="profile-page-container">
            {/* Profile Section */}
            <div className="profile-container">
                <div className="profile-pic-container">
                    <img src={profilePic} alt="Profile" className="profile-pic"/>
                </div>
                <button className="cam-icon-btn" onClick={toggleProfilePicModal}>
                    <img src={camIcon} alt="Profile Pic Change"/>
                </button>

                <div className="profile-info-container">
                    <div className="profile-info">
                        <h4 className="user-header"><strong>My Profile:</strong></h4>
                        <h3>{firstName} {lastName}</h3>
                        <p><strong>Age:</strong> {age}</p>
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Phone Number:</strong> {phoneNumber}</p>
                        <button className="edit-profile-btn" onClick={toggleEditProfileModal}>Edit Profile</button>
                    </div>
                </div>
            </div>

            {/* Registered Events Section */}
            <div className="registered-container">
                <h4>Registered Events</h4>
                {registeredEvents.length > 0 ? (
                    <ul className="registered-list">
                        {registeredEvents.slice(0, isExpanded ? registeredEvents.length : 3).map(event => (
                            <li key={event.id} className="registered-item">
                                <div className="registered-item-content">
                                    <strong>{event.name}</strong> - {formatDate(event.date)}
                                </div>
                                <div className="registered-item-buttons">
                                    <button
                                        className="btn btn-info info-button"
                                        onClick={() => handleInfoClick(event)}
                                    >
                                        Info
                                    </button>
                                    <button
                                        className="btn btn-danger leave-button"
                                        onClick={() => handleLeaveEvent(event.id)}
                                    >
                                        Leave Event
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No registered events yet.</p>
                )}
                {registeredEvents.length > 3 && (
                    <button onClick={toggleExpand} className="expand-btn">
                        {isExpanded ? 'Show Less' : 'View More'}
                    </button>
                )}
            </div>

            {/* Edit Profile Modal */}
            <Modal isOpen={editProfileModal} toggle={toggleEditProfileModal}>
                <ModalHeader toggle={toggleEditProfileModal}>Edit Profile</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="firstName">First Name</Label>
                            <Input type="text" id="firstName" value={firstName} disabled/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="lastName">Last Name</Label>
                            <Input type="text" id="lastName" value={lastName} disabled/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="birthDate">Birth Date</Label>
                            <Input type="date" id="birthDate" value={birthDate} disabled/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="phoneNumber">Phone Number</Label>
                            <Input
                                type="text"
                                id="phoneNumber"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleEditProfile}>Save Changes</Button>
                    <Button color="secondary" onClick={toggleEditProfileModal}>Cancel</Button>
                </ModalFooter>
            </Modal>

            {/* Change Profile Picture Modal */}
            <Modal isOpen={profilePicModalOpen} toggle={toggleProfilePicModal}>
                <ModalHeader toggle={toggleProfilePicModal}>Change Profile Picture</ModalHeader>
                <ModalBody>
                    <div className="profile-pic-preview-container">
                        <img src={preview} alt="Profile Preview" className="profile-pic-preview"/>
                    </div>
                    <Input type="file" accept="image/*" onChange={handleProfilePicChange}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={saveProfilePic}>Save</Button>
                    <Button color="secondary" onClick={toggleProfilePicModal}>Cancel</Button>
                </ModalFooter>
            </Modal>

            <EventInfoModal isOpen={infoModalOpen} toggle={toggleInfoModal} event={selectedEvent}/>
        </div>
    );
};

export default Profile;
