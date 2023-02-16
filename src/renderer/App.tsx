import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import TimeTable from './TimeTable';

const MINUTE_MS = 60000;

interface StationItem {
  arrival: number | null;
  departure: number | null;
}

function Hello() {
  const [northStopTimeUpdates, setNorthStopTimeUpdates] = useState<number[]>([])
  const [southStopTimeUpdates, setSouthStopTimeUpdates] = useState<number[]>([])

  async function fetchSchedule() {
    const result = await window.electron.ipcRenderer.invoke('request-feed', [])
    setNorthStopTimeUpdates(result.northStopTimes.map((item: StationItem) => item.arrival).sort())
    setSouthStopTimeUpdates(result.southStopTimes.map((item: StationItem) => item.arrival).sort())
  }

  useEffect(() => {
    fetchSchedule()
    const interval = setInterval(() => {
      fetchSchedule()
    }, MINUTE_MS);
  
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <TimeTable timeUpdates={northStopTimeUpdates} title='Flushing Bound Arrival Times' />
      <TimeTable timeUpdates={southStopTimeUpdates} title='Manhattan Bound Arrival Times' />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
