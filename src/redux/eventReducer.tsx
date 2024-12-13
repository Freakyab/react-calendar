import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  parse,
  parseISO,
  format,
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

// Utility function to get filled slots
const getIndexFilledSlots = (
  startTime: string,
  endTime: string,
  slots: boolean[]
) => {

  // Get the leading and trailing time
  // for example, 10:30 will be leading = 10 and trailing = 30
  // get start and end index based on leading and trailing time
  const startLeading = parseInt(startTime.split(":")[0]);
  const endLeading = parseInt(endTime.split(":")[0]);
  const startTrailing = parseInt(startTime.split(":")[1]);
  const endTrailing = parseInt(endTime.split(":")[1]);

  // Calculate the start and end index 
  // if the start time is 10:30, then the index will be 10*2 + 30/30 = 21
  const startIndex = startLeading * 2 + Math.floor(startTrailing / 30);

  // if the end time is 11:30, then the index will be 11*2 + 30/30 = 23
  const endIndex = endLeading * 2 + Math.floor(endTrailing / 30);

  // Fill the slots array with true value from start index to end index
  // for example, if the start time is 10:30 and end time is 11:30
  // then the slots array will be filled with true value from index 21 to 23
  slots.fill(true, startIndex, endIndex);
};

// Utility function to check if slot is available
const checkIfSlotAvailable = (newEvent: eventPayload, slots: boolean[]) => {

  // Get the leading and trailing time
  const startLeading = parseInt(newEvent.startTime.split(":")[0]);
  const endLeading = parseInt(newEvent.endTime.split(":")[0]);
  const startTrailing = parseInt(newEvent.startTime.split(":")[1]);
  const endTrailing = parseInt(newEvent.endTime.split(":")[1]);

  // Calculate the start and end index
  const startIndex = startLeading * 2 + Math.floor(startTrailing / 30);
  const endIndex = endLeading * 2 + Math.floor(endTrailing / 30);

  // Check if the slot is available by checking if all the slots from start index to end index are false
  const isAvailable = slots.slice(startIndex, endIndex).every((slot) => !slot);

  // Return the availability of the slot
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

      // Get the new event payload
      const newEvent = action.payload;

      // Validate event ID
      if (!newEvent.id) {
        throw new Error("Event ID is required for adding an event");
      }

      // Check if the events array is empty then add the event
      if (state.events.length === 0) {
        state.events.push(newEvent);
      } else {

        // Get all the events on the date of the new event
        const eventsOnDate = state.events.filter(
          (event) =>
            format(parseISO(event.date), "yyyy-MM-dd") ===
            format(parseISO(newEvent.date), "yyyy-MM-dd")
        );

        // Get the filled slots based on the events on the date
        eventsOnDate.forEach((event) => {
          getIndexFilledSlots(event.startTime, event.endTime, slots);
        });

        // Check if the slot is available
        if (checkIfSlotAvailable(newEvent, slots)) {
          state.events.push(newEvent);
        } else {

          // Throw error if the slot is not available
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

    // Delete event action
    deleteEvent: (state, action: PayloadAction<number>) => {

      // Filter out the event based on the event ID
      state.events = state.events.filter(
        (event) => event.id !== action.payload
      );

    },

    // Update event action
    updateEvent: (state, action: PayloadAction<eventPayload>) => {

      // Sort events based on date and time
      const updatedEvent = action.payload;

      // Validate event ID
      if (!updatedEvent.id) {
        throw new Error("Event ID is required for updating an event");
      }

      // Create slot array of 48 false value
      let slots = new Array(48).fill(false);

      // Get all the events on the date of the updated event
      const eventsOnDate = state.events.filter(
        (event) =>
          format(parseISO(event.date), "yyyy-MM-dd") ===
          format(parseISO(updatedEvent.date), "yyyy-MM-dd")
      );

      // Get the filled slots based on the events on the date
      eventsOnDate.forEach((event) => {
        if (event.id !== updatedEvent.id) {
          getIndexFilledSlots(event.startTime, event.endTime, slots);
        }
      });

      // Check if the slot is available
      if (checkIfSlotAvailable(updatedEvent, slots)) {
        state.events = state.events.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        );
      } else {
        // Throw error if the slot is not available
        throw new Error(
          "Time slot is already booked or overlaps with another event"
        );
      }

      // Sort events based on date and time
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
