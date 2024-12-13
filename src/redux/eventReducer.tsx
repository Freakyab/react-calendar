import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import {
  parse,
  isWithinInterval,
  parseISO,
  format,
  formatDate,
} from "date-fns";

// Type for event payload
export type eventPayload = {
  id: number;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  link: string;
  category: string;
  location: string;
};

const initialState: {
  events: eventPayload[];
} = {
  events: [],
};

// Utility function to parse date and time
const parseDateTime = (date: string, time: string): Date => {
  return parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
};

const getIndexFilledSlots = (
  startTime: string,
  endTime: string,
  slots: boolean[]
) => {
  const startLeading = parseInt(startTime.split(":")[0]);
  const endLeading = parseInt(endTime.split(":")[0]);
  const startTrailing = parseInt(startTime.split(":")[1]);
  const endTrailing = parseInt(endTime.split(":")[1]);

  const startIndex = startLeading * 2 + Math.floor(startTrailing / 30);
  const endIndex = endLeading * 2 + Math.floor(endTrailing / 30);

  slots.fill(true, startIndex, endIndex);
};

const checkIfSlotAvailable = (newEvent: eventPayload, slots: boolean[]) => {
  const startLeading = parseInt(newEvent.startTime.split(":")[0]);
  const endLeading = parseInt(newEvent.endTime.split(":")[0]);
  const startTrailing = parseInt(newEvent.startTime.split(":")[1]);
  const endTrailing = parseInt(newEvent.endTime.split(":")[1]);

  const startIndex = startLeading * 2 + Math.floor(startTrailing / 30);
  const endIndex = endLeading * 2 + Math.floor(endTrailing / 30);

  const isAvailable = slots.slice(startIndex, endIndex).every((slot) => !slot);

  return isAvailable;
};

// Event reducer
const eventReducer = createSlice({
  name: "event",
  initialState: initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<eventPayload>) => {
      // create slot array of 48 false value
      let slots = new Array(48).fill(false);

      const newEvent = action.payload;

      // Validate event ID
      if (!newEvent.id) {
        throw new Error("Event ID is required for adding an event");
      }

      if (state.events.length === 0) {
        state.events.push(newEvent);
      } else {
        const eventsOnDate = state.events.filter(
          (event) =>
            format(parseISO(event.date), "yyyy-MM-dd") ===
            format(parseISO(newEvent.date), "yyyy-MM-dd")
        );

        eventsOnDate.forEach((event) => {
          getIndexFilledSlots(event.startTime, event.endTime, slots);
        });

        if (checkIfSlotAvailable(newEvent, slots)) {
          state.events.push(newEvent);
        } else {
          throw new Error(
            "Time slot is already booked or overlaps with another event"
          );
        }
      }
      // Sort events based on date and time
      state.events.sort((a, b) => {
        const dateA = parseDateTime(a.date, a.startTime);
        const dateB = parseDateTime(b.date, b.startTime);
        return dateA.getTime() - dateB.getTime();
      });
    },
    deleteEvent: (state, action: PayloadAction<number>) => {
      state.events = state.events.filter(
        (event) => event.id !== action.payload
      );
    },
    updateEvent: (state, action: PayloadAction<eventPayload>) => {
      // Sort events based on date and time
      const updatedEvent = action.payload;

      if (!updatedEvent.id) {
        throw new Error("Event ID is required for updating an event");
      }

      let slots = new Array(48).fill(false);

      const eventsOnDate = state.events.filter(
        (event) =>
          format(parseISO(event.date), "yyyy-MM-dd") ===
          format(parseISO(updatedEvent.date), "yyyy-MM-dd")
      );

      eventsOnDate.forEach((event) => {
        if (event.id !== updatedEvent.id) {
          getIndexFilledSlots(event.startTime, event.endTime, slots);
        }
      });

      if (checkIfSlotAvailable(updatedEvent, slots)) {
        state.events = state.events.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        );
      } else {
        throw new Error(
          "Time slot is already booked or overlaps with another event"
        );
      }

      state.events.sort((a, b) => {
        const dateA = parseDateTime(a.date, a.startTime);
        const dateB = parseDateTime(b.date, b.startTime);
        return dateA.getTime() - dateB.getTime();
      });
    },
  },
});

// Exporting event actions
export const Events = eventReducer.actions;
export default eventReducer.reducer;
