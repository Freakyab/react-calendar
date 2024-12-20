// import React from 'react'

import Calendar from "./components/calendar";
import Sidenav from "./components/sidenav";
import CreateEvent from "./components/createEvent";
import EventDetails from "./components/eventDetails";
import { useState } from "react";

function App() {
  const [updateEventId, setUpdateEventId] = useState(-1);

  return (
    <div className="flex flex-col-reverse sm:flex-row bg-secondary bg-gradient-to-r from-cyan-400/0 to-blue-600/10 text-white">
      <Sidenav setUpdateEventId={setUpdateEventId} />
      <Calendar setUpdateEventId={setUpdateEventId} />
      <CreateEvent />
      <EventDetails updateEventId={updateEventId} />
    </div>
  );
}

export default App;
