import { ReactComponentElement, ReactElement, useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings'

const stationId = '719'
const stationIdNorth = stationId + 'N'
const stationIdSouth = stationId + 'S'

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
  const [northStopTimeUpdates, setNorthStopTimeUpdates] = useState<StationItem[]>([])
  const [southStopTimeUpdates, setSouthStopTimeUpdates] = useState<StationItem[]>([])

  function handleFeed(feed: GtfsRealtimeBindings.transit_realtime.FeedMessage) {
    feed.entity.forEach((entity) => {
      if (entity.tripUpdate && entity.tripUpdate.trip.routeId === '7') {
        let northStopTimeUpdate = entity.tripUpdate.stopTimeUpdate?.filter(stop => stop.stopId == stationIdNorth)
        let southStopTimeUpdate = entity.tripUpdate.stopTimeUpdate?.filter(stop => stop.stopId == stationIdSouth)
        if (northStopTimeUpdate?.length == 1) {
          const newVal = {arrival: Number(northStopTimeUpdate[0].arrival?.time), departure: Number(northStopTimeUpdate[0].departure?.time)}
          setNorthStopTimeUpdates(current => [...current, newVal])
        }
        if (southStopTimeUpdate?.length == 1) {
          const newVal = {arrival: Number(southStopTimeUpdate[0].arrival?.time), departure: Number(southStopTimeUpdate[0].departure?.time)}
          setSouthStopTimeUpdates(current => [...current, newVal])
        }
      }
    });
  }

  async function fetchSchedule() {
    const result = await window.electron.ipcRenderer.invoke('request-feed', [])
    setNorthStopTimeUpdates(result.northStopTimes)
    setSouthStopTimeUpdates(result.southStopTimes)
  }

  useEffect(() => {
    fetchSchedule()
  }, [])

  return (
    <div>
      <h1>Flushing Bound Arrival Times</h1>
      <div className="Hello">
        <ul>
          {northStopTimeUpdates
          .map(item => getMinutesFromNow(item.arrival))
          .filter(item => item >= 0)
          .sort()
          .map(arrival =><li key={arrival}>{arrival}</li>)}
        </ul>
      </div>
      <h1>Manhattan Bound Arrival Times</h1>
      <div className="Hello">
        <ul>
          {southStopTimeUpdates
          .map(item => getMinutesFromNow(item.arrival))
          .filter(item => item >= 0)
          .sort()
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
