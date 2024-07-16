// src/components/EventPost.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const EventPost = ({ name, date, time, mainArea, specificPlace, recommendedAges, dressCode, image }) => {
    return (
        <div className="card mb-3">
            <img src={image} className="card-img-top" alt={name} />
            <div className="card-body">
                <h5 className="card-title">{name}</h5>
                <p className="card-text"><strong>Date:</strong> {date}</p>
                <p className="card-text"><strong>Time:</strong> {time}</p>
                <p className="card-text"><strong>Main Area:</strong> {mainArea}</p>
                <p className="card-text"><strong>Specific Place:</strong> {specificPlace}</p>
                <p className="card-text"><strong>Recommended Ages:</strong> {recommendedAges.join(', ')}</p>
                <p className="card-text"><strong>Dress Code:</strong> {dressCode}</p>
            </div>
        </div>
    );
};

export default EventPost;
