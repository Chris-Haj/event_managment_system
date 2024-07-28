import React, { useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import db from '../DB/firebase';
import AuthContext from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { currentUser } = useContext(AuthContext);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');

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
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    return (
        <div className="profile-container profile-field">
            <div className="profileName">
                <h2>{firstName} {lastName}</h2>
            </div>
        </div>
    );
};

export default Profile;
