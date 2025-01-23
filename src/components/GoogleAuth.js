import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './GoogleAuth.css';

const GoogleAuth = () => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [files, setFiles] = useState([]);
  const [pageSize, setPageSize] = useState(10); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      localStorage.setItem('access_token', tokenResponse.access_token);
      fetchUserInfo(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    flow: 'implicit',
    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  });

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchGoogleDriveFiles = async () => {
    const token = accessToken || localStorage.getItem('access_token');

    if (!token) {
      alert('Please log in first');
      return;
    }

    try {
      const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          pageSize: pageSize,
          fields: 'files(id, name, mimeType, webViewLink)',
        },
      });

      setFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching Google Drive files:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        handleLogout();
      }
    }
  };

  const handleSearch = async () => {
    const token = accessToken || localStorage.getItem('access_token');

    if (!token) {
      alert('Please log in first');
      return;
    }

    try {
      const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: `name contains '${searchQuery}'`,
          fields: 'files(id, name, mimeType, webViewLink)',
        },
      });

      if (response.data.files.length > 0) {
        setSearchResult(response.data.files);
      } else {
        setSearchResult([]);
      }
    } catch (error) {
      console.error('Error searching for file:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    setFiles([]);
    setSearchQuery('');
    setSearchResult(null);
    localStorage.removeItem('access_token');
  };

  return (
    <div className='container'>
      {!user ? (
        <button className="button1" onClick={() => login()}>
          Sign in with Google
        </button>
      ) : (
        <div className=''>
          <h3>Welcome, {user.name}</h3>
          <button className="button1" onClick={handleLogout}>
            Logout
          </button>
          <div style={{ marginBottom: '10px', marginTop: '20px' }}>
            <label htmlFor="pageSize">Number of files to fetch: </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="button1"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button className="button1" onClick={fetchGoogleDriveFiles}>
            Fetch Google Drive Files
          </button>
          <div style={{ marginTop: '20px' }}>
            <h4>Your Google Drive Files:</h4>
            {files.length === 0 ? (
              <p>No files found.</p>
            ) : (
              <ul>
                {files.map((file) => (
                  <li key={file.id}>
                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                      {file.name} ({file.mimeType})
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ marginTop: '20px' }}>
            <h4>Search for a File:</h4>
            <input
              type="text"
              placeholder="Enter file name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="button1"
            />
            <button className="button1" onClick={handleSearch}>
              Search
            </button>
            {searchResult !== null && (
              <div style={{ marginTop: '20px' }}>
                <h4>Search Results:</h4>
                {searchResult.length === 0 ? (
                  <p>No such file found in your drive.</p>
                ) : (
                  <ul>
                    {searchResult.map((file) => (
                      <li key={file.id}>
                        <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                          {file.name} ({file.mimeType})
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;
