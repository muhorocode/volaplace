import { useEffect, useState } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setApiStatus(data.status))
      .catch(() => setApiStatus('disconnected'));
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