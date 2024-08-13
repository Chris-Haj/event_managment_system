import { gapi } from 'gapi-script';

const clientId = process.env.REACT_APP_GOOGLE_CALENDER_CLIENT_ID;

export const initGoogleClient = () => {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            clientId: clientId,
            scope: 'https://www.googleapis.com/auth/calendar.events',
        });
    });
};

export const loginWithGoogle = () => {
    return new Promise((resolve, reject) => {
        gapi.auth2.getAuthInstance().signIn().then(
            (response) => {
                gapi.client.setToken({ access_token: response.getAuthResponse().access_token });
                resolve(response);
            },
            (error) => reject(error)
        );
    });
};

export const addEventToGoogleCalendar = async (event) => {
    try {
        const response = await gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: {
                summary: event.name,
                location: `${event.location.mainArea}, ${event.location.specificPlace}`,
                description: event.description,
                start: {
                    dateTime: `${event.date}T${event.timeStart}:00`,
                    timeZone: 'America/Los_Angeles',
                },
                end: {
                    dateTime: `${event.date}T${event.timeEnd}:00`,
                    timeZone: 'America/Los_Angeles',
                },
            },
        });
        console.log('Event added to Google Calendar: ', response);
    } catch (error) {
        console.error('Error adding event to Google Calendar: ', error);
    }
};
