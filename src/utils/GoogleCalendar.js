import { gapi } from 'gapi-script';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CALENDER_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_CALENDER_API_KEY;

export const initGoogleCalendarClient = () => {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            scope: "https://www.googleapis.com/auth/calendar.events",
        });
    });
};

export const addEventToGoogleCalendar = (event) => {
    const eventDetails = {
        'summary': event.name,
        'description': event.description,
        'start': {
            'dateTime': `${event.date}T${event.timeStart}:00`,
            'timeZone': 'Asia/Jerusalem',  // Set the timezone to Israel
        },
        'end': {
            'dateTime': `${event.date}T${event.timeEnd}:00`,
            'timeZone': 'Asia/Jerusalem',  // Set the timezone to Israel
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 10 },
            ],
        },
    };

    gapi.auth2.getAuthInstance().signIn().then(() => {
        const request = gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': eventDetails,
        });

        request.execute((event) => {
            console.log('Event created: ', event.htmlLink);
        });
    });
};
