import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isWeekend,
  subWeeks,
  addWeeks,
} from "date-fns";
import { Calendar1, ChevronLeft, ChevronRight, ListIcon } from "lucide-react";
import useEvents from "@/redux/useEvents";
import { useModelOption } from "@/context";
import { eventColor } from "./eventColors";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const Calendar = ({
  setUpdateEventId,
}: {
  setUpdateEventId: (id: number) => void;
}) => {
  // To track the current month
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeekDay, setCurrentWeekDay] = useState(new Date());

  // To toggle between calendar and list view
  const [isCalendarFormat, setIsCalendarFormat] = useState(true);

  // Get events and updateEvent function from redux
  const { events, updateEvent } = useEvents();

  // Get controlOption and setControlOption function from context
  const { controlOption, setControlOption } = useModelOption();

  // Function to render the header of the calendar and navigate between months
  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center p-2">
        {/* Navigation Buttons*/}

        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft />
        </button>
        <h2 className="text-xl">{format(currentMonth, "MMMM yyyy")}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight />
        </button>
      </div>
    );
  };

  // Function to render the days of the week
  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className={`grid grid-cols-7 text-lg py-2 text-center font-light`}>
        {days.map((day, index) => (
          <div key={index} className={`p-2`}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  // Function to render the list view of the calendar
  const renderListCells = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) =>
      format(addDays(currentWeekDay, i), "yyyy-MM-dd")
    );

    // Create time slots for the list view
    const timeSlots = Array.from(
      { length: 48 },
      (_, hour) =>
        // Format the time slots as 12-hour format
        `${
          Math.floor(hour / 2) > 12
            ? Math.floor(hour / 2) - 12
            : Math.floor(hour / 2) === 0
            ? 12
            : Math.floor(hour / 2)
        }:${hour % 2 === 0 ? "00" : "30"} ${
          Math.floor(hour / 2) >= 12 ? "PM" : "AM"
        }`
    );

    const countEventsForDate = (date: string) => {
      return events.filter((event) => event.date === date).length;
    };

    return (
      <div className="grid grid-cols-[max-content_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 py-2">
        {/* Time Slots Column */}
        <div className="flex flex-col border-r border-gray-600 px-2">
          <div className=" text-white p-2 text-center font-light">Time</div>
          {timeSlots.map((time, hour) => (
            <div
              key={hour}
              className="h-8 border-t border-gray-600 flex items-center justify-center">
              {time}
            </div>
          ))}
        </div>

        {/* Days of the Week */}
        {weekDays.map((day) => (
          <div key={day} className="flex flex-col border border-gray-600">
            <div className="p-2 text-center font-light">
              {/* {day} */}
              {format(new Date(day), "EEE dd")}
              {countEventsForDate(day) > 0 && (
                <span className=" inline-flex h-fit p-1 px-2 ml-2 bg-red-500 rounded-full justify-center items-center text-xs">
                  {countEventsForDate(day)}
                </span>
              )}
            </div>

            {/* Hour Slots */}
            {Array.from({ length: 48 }, (_, hour) => (
              <div key={hour} className="h-8 border-t relative">
                {/*  Event Slots */}
                {events
                  .filter((event) => event.date === day)
                  .map((event) => {
                    // Calculate the start and end slot of the event by converting the time to 30-minute slots
                    const startSlot =
                      parseInt(event.startTime.split(":")[0]) * 2 +
                      Math.floor(parseInt(event.startTime.split(":")[1]) / 30);

                    const endSlot =
                      parseInt(event.endTime.split(":")[0]) * 2 +
                      Math.floor(parseInt(event.endTime.split(":")[1]) / 30);

                    // Render the event if the current hour slot is the start slot
                    if (hour === startSlot) {
                      return (
                        <div
                          key={event.id}
                          onClick={() => {
                            setUpdateEventId(event.id);
                            setControlOption({
                              ...controlOption,
                              isEventDetails: true,
                              isModelOpen: false,
                            });
                          }}
                          style={{
                            height: `${(endSlot - startSlot) * 2}rem`,
                            top: 0,
                            position: "absolute",
                            width: "100%",
                          }}
                          className={` first-letter:capitalize leading-8 text-sm
                          ${
                            eventColor[
                              event.category as keyof typeof eventColor
                            ].backgroundColor
                          }
                          ${
                            eventColor[
                              event.category as keyof typeof eventColor
                            ].primary
                          }
                          pl-2 cursor-pointer`}>
                          {event.title}
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderListHeader = () => {
    return (
      <div className="flex justify-between items-center p-2">
        {/* Navigation Buttons*/}
        {/* update the current week day to next or week day
         */}
        <button onClick={() => setCurrentWeekDay(subWeeks(currentWeekDay, 1))}>
          <ChevronLeft />
        </button>
        <h2 className="text-xl">{format(currentWeekDay, "dd MMMM yyyy")}</h2>
        <button onClick={() => setCurrentWeekDay(addWeeks(currentWeekDay, 1))}>
          <ChevronRight />
        </button>
      </div>
    );
  };

  // Function to render the cells of the calendar
  const renderCells = () => {
    // Get the start and end date of the month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    // Function to handle the drag and drop of the events
    const handleDragEnd = (result: any) => {
      if (!result.destination) return;
      const { source, destination, draggableId } = result;
      // If the source and destination are the same, return
      if (source.droppableId === destination.droppableId) return;

      // Get the event id, source date, and destination date
      const eventId = draggableId.replace("event-", "");

      // Get the source and destination date
      const sourceDate = source.droppableId.replace("droppable-", "");
      const destinationDate = destination.droppableId.replace("droppable-", "");

      // If the source and destination date are the same, return
      if (sourceDate === destinationDate) return;

      // Find the event from the events array for the given event id
      const event = events.find((event) => event.id === parseInt(eventId));

      // If the event is not found, return
      if (!event) return;

      // Create a new event with the updated date
      let newEvent = { ...event, date: destinationDate };

      // Update the event in the redux store
      try {
        updateEvent(newEvent);
      } catch (e) {
        console.error(e);
        alert(e);
      }
    };

    // Rendering UI by looping through the days of the month
    while (day <= endDate) {
      // Loop through the days of the week
      for (let i = 0; i < 7; i++) {
        // Format the date and get the cell date
        const formattedDate = format(day, "d");
        const cellDate = format(day, "yyyy-MM-dd");

        // Check if the current day is in the current month
        const isCurrentMonth = day >= monthStart && day <= monthEnd;

        // Check if the current day is a weekend
        const isCurrentDayWeekend = isWeekend(day);

        // Push the day to the days array for the current row
        days.push(
          <Droppable
            droppableId={`droppable-${cellDate}`}
            key={`cell-${cellDate}`}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                onClick={() => {
                  const hasEvents = events.some(
                    (event) => event.date === cellDate
                  );
                  if (hasEvents) return;
                  setControlOption({
                    ...controlOption,
                    selectedDate: new Date(cellDate),
                    isModelOpen: true,
                  });
                }}
                className={`p-2 border-[2px] border-secondary hover:bg-slate-700 text-black rounded-md 
                  ${isCurrentDayWeekend && "text-red-500"}
                  ${
                    isCurrentMonth && !isCurrentDayWeekend
                      ? "text-white"
                      : "text-gray-400"
                  } ${
                  format(new Date(), "yyyy-MM-dd") === cellDate
                    ? "bg-gradient-to-r from-blue-600/50 to-cyan-400/40"
                    : ""
                } `}>
                {formattedDate}
                <div className="flex flex-col overflow-y-auto max-h-14 gap-1 items-stretch pt-1">
                  {/* 
                    Loop through the events and render the events for the current day
                  */}
                  {events
                    .filter((event) => event.date === cellDate)
                    .map((event, index) => (
                      <Draggable
                        key={`event-${event.id}`}
                        index={index}
                        draggableId={`event-${event.id}`}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={(e) => {
                              e.stopPropagation();
                              setUpdateEventId(event.id);
                              setControlOption({
                                ...controlOption,
                                isEventDetails: true,
                                isModelOpen: false,
                              });
                            }}
                            className={`${
                              eventColor[
                                event.category as keyof typeof eventColor
                              ].backgroundColor
                            } ${
                              eventColor[
                                event.category as keyof typeof eventColor
                              ].primary
                            } first-letter:capitalize text-sm px-2 rounded-xl cursor-pointer line-clamp-1`}>
                            {event.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        );

        // Increment the day by 1
        day = addDays(day, 1);
      }

      // Push the days to the rows array  and reset the days array for the next row
      rows.push(
        <div key={`row-${day.toISOString()}`} className="grid grid-cols-7 h-24">
          {days}
        </div>
      );
      days = [];
    }

    // Return the calendar UI with drag and drop context
    return <DragDropContext onDragEnd={handleDragEnd}>{rows}</DragDropContext>;
  };

  return (
    <div className="w-full sm:h-screen px-4 py-2 overflow-auto">
      <div className="flex gap-2 justify-between w-full my-2">
        {/* 
          Search Input and Calendar/List View Toggle
        */}
        <div className="flex w-full items-end ">
          <input
            value={controlOption.searchQuery}
            onChange={(e) =>
              setControlOption({
                ...controlOption,
                searchQuery: e.target.value,
              })
            }
            type="text"
            placeholder="Search events"
            className=" border w-full h-12 px-4 bg-secondary rounded-lg"
          />
        </div>

        {/* 
          Calendar/List View Toggle
        */}
        <div className="ml-auto text-white border-cyan-800 border-2 flex w-fit rounded-xl">
          <button
            className={`${
              isCalendarFormat &&
              "bg-gradient-to-r from-blue-600/50 to-cyan-400/40 rounded-l-lg text-white"
            } p-2`}
            onClick={() => setIsCalendarFormat(true)}>
            <Calendar1 />
          </button>

          <button
            className={`${
              !isCalendarFormat &&
              "bg-gradient-to-r from-blue-600/50 to-cyan-400/40 rounded-r-lg text-white"
            } p-2`}
            onClick={() => setIsCalendarFormat(false)}>
            <ListIcon />
          </button>
        </div>
      </div>

      {/* 
        Render the calendar or list view based on the isCalendarFormat state
      */}
      {isCalendarFormat ? (
        <React.Fragment>
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {renderListHeader()}
          {renderListCells()}
        </React.Fragment>
      )}
    </div>
  );
};

export default Calendar;
