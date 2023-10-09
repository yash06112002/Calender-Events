import React, { useState, useEffect } from 'react';
import "./App.css"
import Events from './components/Events';

const CLIENT_ID = "1036190372990-jsvj0bi0h9ldghov6irvm1nc7kroivrp.apps.googleusercontent.com";
const API_KEY = "AIzaSyD2kw7me0dI7k0D08JEi7DZxdOyfW8T-Fs";

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

function App() {
  const [tokenClient, setTokenClient] = useState(null);
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [events, setEvents] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load Google API client library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = gapiLoaded;
    document.body.appendChild(script);

    // Load Google Identity Services library
    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.defer = true;
    gsiScript.onload = gisLoaded;
    document.body.appendChild(gsiScript);

    document.getElementById('signout_button').style.visibility = 'hidden';
    document.getElementById('authorize_button').style.visibility = 'visible';
    document.getElementById('refresh_button').style.visibility = 'hidden';
    return () => {
      // Cleanup: Remove the script elements when the component unmounts
      document.body.removeChild(script);
      document.body.removeChild(gsiScript);
    };
  }, []);

  const gapiLoaded = () => {
    window.gapi.load('client', initializeGapiClient);
  };

  const initializeGapiClient = async () => {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    setGapiInited(true);
    maybeEnableButtons();
  };

  const gisLoaded = () => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined later
    });
    setTokenClient(tokenClient);
    setGisInited(true);
    maybeEnableButtons();
  };

  const maybeEnableButtons = () => {
    if (gapiInited && gisInited) {
      document.getElementById('authorize_button').style.visibility = 'visible';
    }
  };

  const handleAuthClick = async () => {
    if (!tokenClient) return;

    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw resp;
      }
      document.getElementById('signout_button').style.visibility = 'visible';
      document.getElementById('authorize_button').style.visibility = 'hidden';
      document.getElementById('refresh_button').style.visibility = 'visible';
      // document.getElementById('authorize_button').innerText = 'Refresh';
      await listUpcomingEvents();
    };

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  };

  const handleSignoutClick = () => {
    console.log(tokenClient)
    const token = window.gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
      setEvents([]);
      // document.getElementById('authorize_button').innerText = 'Connect with Google Calendar';
      document.getElementById('authorize_button').style.visibility = 'visible';
      document.getElementById('signout_button').style.visibility = 'hidden';
      document.getElementById('refresh_button').style.visibility = 'hidden';
    }
  };

  const listUpcomingEvents = async () => {
    try {
      const request = {
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: 'startTime',
      };
      const response = await window.gapi.client.calendar.events.list(request);
      const events = response.result.items || [];
      setEvents(events);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div>
      <div>
        <button id="authorize_button" onClick={handleAuthClick}>
          Connect with Google Calendar
        </button>
      </div>
      <div style={{ marginBottom: "10px" }}>
        <button id="refresh_button" onClick={listUpcomingEvents}>
          Refresh
        </button>
      </div>
      <div>
        <button id="signout_button" onClick={handleSignoutClick}>
          Sign Out
        </button>
      </div>

      <pre id="content" style={{ whiteSpace: 'pre-wrap' }}>
        {errorMessage || (
          <div>
            {events.length === 0 ? (
              ''
            ) : (
              <>
                <span>Events:</span>
                <Events events={events} />
              </>
            )}
          </div>
        )}
      </pre>
    </div>
  );
}

export default App;
