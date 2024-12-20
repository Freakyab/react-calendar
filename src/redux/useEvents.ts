import { AppDispatch, RootState } from './store';
import { useDispatch, useSelector } from 'react-redux';
import { Events } from './eventReducer';

import { eventPayload } from './eventReducer';

const useEvents = () => {
    const events = useSelector((state: RootState) => state.events.events);
    const dispatch = useDispatch<AppDispatch>();

    const addEvent = (data: eventPayload) => {
        dispatch(Events.addEvent(data));
    };

    const deleteEvent = (id: number) => {
        dispatch(Events.deleteEvent(id));
    };

    const updateEvent = (event: eventPayload) => {
        dispatch(Events.updateEvent(event));
    };

    const AllDeleteEvent = () => {
        dispatch(Events.deleteAllEvents());
    }

    return { events, addEvent, deleteEvent, updateEvent, AllDeleteEvent };
}

export default useEvents;