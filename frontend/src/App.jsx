import { useEffect, useState } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/health';
  
  fetch(apiUrl)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => setApiStatus(data.status))
    .catch((error) => {
      console.error("Connection failed:", error);
      setApiStatus('disconnected');
    });
}, []);
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>VolaPlace</h1>
      <p>Geo-verified volunteer marketplace</p>
      <p>Backend Status: <strong>{apiStatus}</strong></p>
    </div>
  );
}

export default App;