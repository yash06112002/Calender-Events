import { useState, useEffect } from 'react';
import Events from './components/Events';
import { Link } from 'react-router-dom';

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

    document.getElementById('signout_button').style.display = 'none';
    document.getElementById('authorize_button').style.display = 'block';
    document.getElementById('refresh_button').style.display = 'none';
    return () => {
      // Cleanup: Remove the script elements when the component unmounts
      // document.body.removeChild(script);
      // document.body.removeChild(gsiScript);
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
      document.getElementById('authorize_button').style.display = 'block';
      document.getElementById('authorize_button_Div').style.display = 'block';
    }
  };

  const handleAuthClick = async () => {
    if (!tokenClient) return;

    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw resp;
      }
      document.getElementById('signout_button').style.display = 'block';
      document.getElementById('authorize_button').style.display = 'none';
      document.getElementById('authorize_button_Div').style.display = 'none';
      document.getElementById('refresh_button').style.display = 'block';
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
    // console.log(tokenClient)
    const token = window.gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
      setEvents([]);
      // document.getElementById('authorize_button').innerText = 'Connect with Google Calendar';
      document.getElementById('authorize_button').style.display = 'block';
      document.getElementById('authorize_button_Div').style.display = 'block';
      document.getElementById('signout_button').style.display = 'none';
      document.getElementById('refresh_button').style.display = 'none';
    }
  };

  const listUpcomingEvents = async () => {
    // console.log(window.gapi)
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
    <div className='relative h-screen w-full bg-gradient-to-r from-green-100 from-10% via-sky-100 via-30% to-pink-100 to-40%'>
      <div className='z-50 absolute flex w-full flex-col md:flex-row md:w-[calc(100%-90px)] justify-around items-center md:mx-10 my-20'>
        <div className='my-5 md:my-0 bg-cyan-500 rounded-md hover:bg-cyan-600 px-10 py-2'>
          <Link to="/profile">Profile</Link>
        </div>
        <div id='authorize_button_Div' className='my-20 md:my-0 bg-cyan-500 rounded-md hover:bg-cyan-600 px-10 py-2'>
          <button id="authorize_button" onClick={handleAuthClick}>
            Connect with Google Calendar
          </button>
        </div>
      </div>
      <div className='z-40 absolute flex w-full flex-col md:flex-row md:w-[calc(100%-90px)] justify-around items-center md:mx-10 my-40'>
        <div className='my-20 md:my-0 bg-cyan-500 rounded-md hover:bg-cyan-600 px-10 py-2' id="refresh_button" onClick={listUpcomingEvents}>
          <button >
            Refresh
          </button>
        </div>
      </div>
      <div className='z-0 absolute md:mx-8 my-60 w-full md:w-[calc(100%-200px)]'>
        <pre id="content" style={{ whiteSpace: 'pre-wrap' }}>
          {errorMessage || (
            <div className='w-full flex-col md:flex-row md:w-[calc(100%-90px)] justify-around items-center md:mx-10'>
              {events.length === 0 ? (
                ''
              ) : (
                <>
                  {/* <span className='absolute -my-6 mx-4 md:-my-10'>Events:</span> */}
                  <Events events={events} />
                </>
              )}
            </div>
          )}
        </pre>
        <div className='flex justify-center my-20 mx-36 md:my-0 md:mx-80 '>
          <div className='bg-cyan-500 rounded-md hover:bg-cyan-600 '>
            <button className='px-4 py-2' id="signout_button" onClick={handleSignoutClick}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
