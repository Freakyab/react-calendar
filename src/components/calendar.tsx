// Dynamic Event Calendar UI
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCalendarFormat, setIsCalendarFormat] = useState(true);

  const { events, updateEvent } = useEvents();
  const { controlOption, setControlOption } = useModelOption();

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center p-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft />
        </button>
        <h2 className="text-2xl">{format(currentMonth, "MMMM yyyy")}</h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className={`grid grid-cols-7 text-xl text-center font-light`}>
        {days.map((day, index) => (
          <div key={index} className={`p-2`}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderListCells = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) =>
      format(addDays(startOfWeek(new Date()), i), "yyyy-MM-dd")
    );

    const timeSlots = Array.from(
      { length: 48 },
      (_, hour) =>
        `${Math.floor(hour / 2)}:${hour % 2 === 0 ? "00" : "30"} ${
          Math.floor(hour / 2) < 12 ? "AM" : "PM"
        }`
    );

    return (
      <div className="grid grid-cols-[max-content_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4">
        {/* Time Slots Column */}
        <div className="flex flex-col border-r border-gray-600 px-2">
          <div className=" text-white p-4 text-center font-light text-xl">
            Time
          </div>
          {timeSlots.map((time, hour) => (
            <div
              key={hour}
              className="h-12 border-t border-gray-600 flex items-center justify-center">
              {time}
            </div>
          ))}
        </div>

        {/* Days of the Week */}
        {weekDays.map((day) => (
          <div key={day} className="flex flex-col border border-gray-600">
            <div className="p-4 text-xl text-center font-light">
              {format(new Date(day), "EEE dd")}
            </div>
            {/* Hour Slots */}
            {Array.from({ length: 48 }, (_, hour) => (
              <div key={hour} className="h-12 border-t relative">
                {events
                  .filter((event) => event.date === day)
                  .map((event) => {
                    const startSlot =
                      parseInt(event.startTime.split(":")[0]) * 2 +
                      Math.floor(parseInt(event.startTime.split(":")[1]) / 30);
                    const endSlot =
                      parseInt(event.endTime.split(":")[0]) * 2 +
                      Math.floor(parseInt(event.endTime.split(":")[1]) / 30);

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
                            height: `${(endSlot - startSlot) * 3}rem`,
                            top: 0,
                            position: "absolute",
                            width: "100%",
                          }}
                          className={`rounded first-letter:capitalize
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
                          pl-2 line-clamp-1 cursor-pointer`}>
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

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    const handleDragEnd = (result: any) => {
      if (!result.destination) return;
      const { source, destination, draggableId } = result;
      const eventId = draggableId.replace("event-", "");
      const sourceDate = source.droppableId.replace("droppable-", "");
      const destinationDate = destination.droppableId.replace("droppable-", "");

      const event = events.find((event) => event.id === parseInt(eventId));
      if (!event) return;

      let newEvent = { ...event, date: destinationDate };
      if (sourceDate === destinationDate) return;
      try {
        updateEvent(newEvent);
      } catch (e) {
        console.error(e);
        alert(e);
      }
    };

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cellDate = format(day, "yyyy-MM-dd");
        const isCurrentMonth = day >= monthStart && day <= monthEnd;
        const isCurrentDayWeekend = isWeekend(day);

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
                className={`p-4 border-[4px] border-secondary hover:bg-slate-700 text-black rounded-md ${
                  isCurrentMonth ? "text-white" : "text-gray-400"
                } ${
                  format(new Date(), "yyyy-MM-dd") === cellDate
                    ? "bg-slate-800"
                    : ""
                } ${isCurrentDayWeekend && "text-red-500"}`}>
                {formattedDate}
                <div className="flex flex-col overflow-y-auto max-h-16 gap-2">
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
                            } first-letter:capitalize p-2 rounded-xl cursor-pointer`}>
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
        day = addDays(day, 1);
      }
      rows.push(
        <div key={`row-${day.toISOString()}`} className="grid grid-cols-7 h-32">
          {days}
        </div>
      );
      days = [];
    }

    return <DragDropContext onDragEnd={handleDragEnd}>{rows}</DragDropContext>;
  };

  return (
    <div className="w-full h-screen p-4 overflow-auto">
      <div className="flex gap-4 justify-between w-full my-2">
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
        <div className="bg-white ml-auto text-black flex w-fit rounded-lg">
          <button
            className={`${
              isCalendarFormat && "bg-green-400 rounded-l-lg text-white"
            } p-2`}
            onClick={() => setIsCalendarFormat(true)}>
            <Calendar1 />
          </button>

          <button
            className={`${
              !isCalendarFormat && "bg-green-400 rounded-r-lg text-white"
            } p-2`}
            onClick={() => setIsCalendarFormat(false)}>
            <ListIcon />
          </button>
        </div>
      </div>
      {isCalendarFormat ? (
        <React.Fragment>
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {/* {renderDays()} */}
          {renderListCells()}
        </React.Fragment>
      )}
    </div>
  );
};

export default Calendar;
