import { ReactComponentElement, ReactElement, useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

const stationId = '719'
const stationIdNorth = stationId + 'N'
const stationIdSouth = stationId + 'S'
const MINUTE_MS = 60000;

interface StationItem {
  arrival: number | null;
  departure: number | null;
}

function getMinutesFromNow(time: number | null) {
  if (time === null) {
    return 0;
  }
  const now = new Date()
  const then = new Date(time * 1000)
  return Math.round((then.getTime() - now.getTime()) / 60000)
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
      <h1>Flushing Bound Arrival Times</h1>
      <div className="Hello">
        <ul>
          {northStopTimeUpdates
          .map(item => getMinutesFromNow(item))
          .filter(item => item >= 0)
          .map(arrival =><li key={arrival}>{arrival}</li>)}
        </ul>
      </div>
      <h1>Manhattan Bound Arrival Times</h1>
      <div className="Hello">
        <ul>
          {southStopTimeUpdates
          .map(item => getMinutesFromNow(item))
          .filter(item => item >= 0)
          .map(arrival =><li key={arrival}>{arrival}</li>)}
        </ul>
      </div>
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
