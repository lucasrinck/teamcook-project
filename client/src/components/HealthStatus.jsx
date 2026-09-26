import { useEffect, useState } from 'react';
import { getHealth } from '../services/api.js';

export default function HealthStatus() {
  const [status, setStatus] = useState('loading…');

  useEffect(() => {
    getHealth()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('unreachable'));
  }, []);

  return <p>API status : {status}</p>;
}
