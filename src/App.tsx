// import React from 'react'

import Calendar from "./components/calendar";
import Sidenav from "./components/sidenav";
import CreateEvent from "./components/createEvent";
import EventDetails from "./components/eventDetails";
import { useEffect, useState } from "react";
import useEvents from "./redux/useEvents";

function App() {
  const [updateEventId, setUpdateEventId] = useState(-1);
  // const { AllDeleteEvent } = useEvents();
  // useEffect(() => {
  //   AllDeleteEvent();
  // }, []);
  return (
    <div className="flex flex-col-reverse sm:flex-row bg-primary text-white">
      <Sidenav setUpdateEventId={setUpdateEventId} />
      <Calendar setUpdateEventId={setUpdateEventId} />
      <CreateEvent />
      <EventDetails updateEventId={updateEventId} />
    </div>
  );
}

export default App;
