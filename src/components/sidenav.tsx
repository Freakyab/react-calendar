import { useEffect, useState } from "react";
import useEvents from "@/redux/useEvents";
import { format } from "date-fns";
import { Plus, Calendar, Archive, Download } from "lucide-react";
import { useModelOption } from "@/context";
import { eventColor } from "./eventColors";
import { eventPayload } from "@/redux/eventReducer";

function Sidenav({
  setUpdateEventId,
}: {
  setUpdateEventId: (id: number) => void;
}) {

  // Fetch events from the redux store
  const { events } = useEvents();

  // Fetch the model options from the context
  const { controlOption, setControlOption } = useModelOption();

  // destructuring the searchQuery from the controlOption
  const { searchQuery } = controlOption;

  // State to store the filtered events
  const [filteredEvents, setFilteredEvents] = useState({
    upcoming: [] as eventPayload[],
    past: [] as eventPayload[],
  });

  // Function to categorize events
  const categorizeEvents = (searchQuery = "") => {
    const today = new Date().toISOString().split("T")[0];
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categorized = {
      upcoming: filtered.filter(
        (event) => new Date(event.date).toISOString().split("T")[0] >= today
      ),
      past: filtered.filter(
        (event) => new Date(event.date).toISOString().split("T")[0] < today
      ),
    };

    setFilteredEvents(
      categorized as {
        upcoming: eventPayload[];
        past: eventPayload[];
      }
    );
  };

  // Update events when `searchQuery` or `events` change
  useEffect(() => {
    categorizeEvents(searchQuery);
  }, [searchQuery, events]);

  // Function to open the model
  const handleModelOpen = () => {
    setControlOption({
      ...controlOption,
      isModelOpen: true,
      isEventDetails: false,
      selectedDate: new Date(),
    });
  };

  // Function to open the event details
  const handleEventDetailsOpen = (id: number) => {
    setUpdateEventId(id);
    setControlOption({
      ...controlOption,
      isEventDetails: true,
      isModelOpen: false,
    });
  };

  // Function to download the events as CSV
  const downloadCsvOfEvent = () => {
    try {
      const csv = events
        .map(
          (event) =>
            `${event.title},${event.date},${event.startTime},${event.endTime},${event.category}\n`
        )
        .join("");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "events.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const EventList = ({
    events,
    title,
  }: {
    events: eventPayload[];
    title: string;
    icon: React.ElementType;
  }) => (
    <div className="mb-6">
      <div className="flex items-center gap-3 p-4 border-b border-gray-700 italic">
        <p className="text-lg font-semibold tracking-wide text-gray-200">
          {title}
        </p>
        {title === "Upcoming Events" && (
          <Download onClick={downloadCsvOfEvent} className="h-6 w-6 text-gray-400 cursor-pointer"
          />
        )}
      </div>
      <div className="flex flex-col gap-4 p-4 overflow-auto max-h-[50vh]">
        {events.map((event) => (
          <div
            key={event.id}
            className={`
              rounded-xl px-4 py-3 flex items-center justify-between 
              cursor-pointer transition-all duration-300 
              hover:scale-[1.02] hover:shadow-lg
              ${
                eventColor[event.category as keyof typeof eventColor]
                  ?.backgroundColor
              }
            `}
            onClick={() => handleEventDetailsOpen(event.id)}>
            <div className="flex items-center gap-2 w-1/3">
              <p
                className={`text-2xl font-bold ${
                  eventColor[event.category as keyof typeof eventColor]?.primary
                }`}>
                {event.date.split("-")[2]}
              </p>
              <div
                className={`flex flex-col font-semibold ${
                  eventColor[event.category as keyof typeof eventColor]
                    ?.secondary
                } text-sm`}>
                <span>{format(new Date(event.date), "MMM")}</span>
                <span>{format(new Date(event.date), "yyyy")}</span>
              </div>
            </div>

            <div className="flex flex-col w-2/3 items-end">
              <p
                className={`text-xl font-extralight first-letter:capitalize line-clamp-1`}>
                {event.title}
              </p>
              <p className="text-sm opacity-70">
                {event.startTime} - {event.endTime}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-[40%] h-screen bg-secondary flex flex-col">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-2xl tracking-wide flex items-center gap-3">
          <Calendar className="h-8 w-8 text-gray-400" />
          React Calendar
        </h2>
        <button
          className="flex items-center gap-3 bg-slate-600 rounded-lg px-4 py-2 text-lg transition-all hover:bg-slate-500"
          onClick={handleModelOpen}>
          <Plus className="h-5 w-5" />
          Create Event
        </button>
      </div>

      {filteredEvents.upcoming.length > 0 && (
        <EventList
          events={filteredEvents.upcoming}
          title="Upcoming Events"
          icon={Calendar}
        />
      )}

      {filteredEvents.past.length > 0 && (
        <EventList
          events={filteredEvents.past}
          title="Past Events"
          icon={Archive}
        />
      )}
    </div>
  );
}

export default Sidenav;
