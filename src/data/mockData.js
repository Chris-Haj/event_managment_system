// src/data/mockEvents.js

const mockEvents = [
    {
        id: 1,
        name: "Community BBQ",
        date: "2024-08-15",
        time: "12:00 PM",
        mainArea: "Neighborhood Park",
        specificPlace: "BBQ Area 3",
        recommendedAges: ["Families", "Senior citizens"],
        dressCode: "Casual",
        permissions: {
            requiresID: true,
            systemAdmin: true,
            authorizedToAdd: true,
            viewAndRegister: true,
        },
        characteristics: {
            ageGroup: ["Families", "Senior citizens"],
            dressCode: "Casual"
        },
    },
    {
        id: 2,
        name: "Art Workshop",
        date: "2024-09-01",
        time: "10:00 AM",
        mainArea: "Community Center",
        specificPlace: "Room 5",
        recommendedAges: ["Families"],
        dressCode: "Casual",
        permissions: {
            requiresID: true,
            systemAdmin: true,
            authorizedToAdd: true,
            viewAndRegister: true,
        },
        characteristics: {
            ageGroup: ["Families"],
            dressCode: "Casual"
        },
    },
    {
        id: 3,
        name: "Community BBQ",
        date: "2024-08-15",
        time: "12:00 PM",
        mainArea: "Neighborhood Park",
        specificPlace: "BBQ Area 3",
        recommendedAges: ["Families", "Senior citizens"],
        dressCode: "Casual",
        permissions: {
            requiresID: true,
            systemAdmin: true,
            authorizedToAdd: true,
            viewAndRegister: true,
        },
        characteristics: {
            ageGroup: ["Families", "Senior citizens"],
            dressCode: "Casual"
        },
    },
    // Add more mock events as needed
];

export default mockEvents;
