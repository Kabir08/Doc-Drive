import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleAuth from './components/GoogleAuth';
import './components/GoogleAuth.css';

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="App">
        <h1 className='container'>Google Drive Integration</h1>
        <GoogleAuth />
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;